import { URL } from 'url';

const INTERNAL_IP_RANGES = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 127.0.0.0/8
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,  // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.0.0/16
];

const isInternalIPv4 = (ip) => {
  return INTERNAL_IP_RANGES.some(range => range.test(ip));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url: targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  // Basic scheme validation
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTP and HTTPS protocols are allowed.' });
  }

  // Hostname validation for localhost and known internal IPv4s
  if (parsedUrl.hostname === 'localhost' || isInternalIPv4(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Access to internal resources is forbidden.' });
  }

  // *** THE SSRF VULNERABILITY (IPv6 Bypass) ***
  // The validation above is IPv4-centric. It *doesn't* explicitly block IPv6 loopback ([::1])
  // or other obscure IPv6 internal addresses. The `fetch` call will resolve this.

  try {
    const response = await fetch(targetUrl, { redirect: 'follow', follow: 0 }); // Prevent redirects for a simpler problem

    if (!response.ok) {
      // Attempt to read error body if available
      let errorText = `Failed to fetch URL: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) errorText += ` - ${errorBody.substring(0, 100)}...`; // Limit error body to 100 chars
      } catch (e) {
        // Ignore if error body can't be read
      }
      return res.status(response.status).json({ error: errorText });
    }

    const content = await response.text();
    return res.status(200).json({ content: content.substring(0, 1000) }); // Limit content to 1000 chars
  } catch (e) {
    // Catch network errors, DNS errors, etc.
    return res.status(500).json({ error: `Network error: ${e.message}` });
  }
}
