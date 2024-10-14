import type { NextApiRequest, NextApiResponse } from 'next';
import kv from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 发送初始数据
    try {
      const jobs = await kv.get('jobs');
      res.write(`data: ${JSON.stringify(jobs || [])}\n\n`);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.write(`data: ${JSON.stringify({ error: 'Unable to fetch jobs' })}\n\n`);
    }

    // 保持连接打开
    const intervalId = setInterval(async () => {
      try {
        const jobs = await kv.get('jobs');
        res.write(`data: ${JSON.stringify(jobs || [])}\n\n`);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }, 10000); // 每10秒更新一次

    // 当客户端断开连接时清理
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
