import type { NextApiRequest, NextApiResponse } from 'next';
import kv from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const jobs = await kv.get('jobs');
      res.status(200).json(jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Unable to fetch jobs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
