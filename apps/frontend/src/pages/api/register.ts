import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Eksik alanlar var' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || 'Kayıt başarısız' });
    }
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Sunucu hatası' });
  }
}
