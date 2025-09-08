import { NextApiRequest, NextApiResponse } from 'next';

const FLAG = process.env.CTF_FLAG || 'CTF{D3f4ult_Fl4g_N0t_S3t}';

export default function handler(req, res) {
  // This endpoint should ideally only be accessible internally via SSRF.
  // In a real CTF, we'd ensure this isn't publicly exposed or directly guessable.
  // For Vercel, this means relying on the fact that [::1] is an internal-only address.

  if (req.method === 'GET') {
    return res.status(200).json({ flag: FLAG });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
