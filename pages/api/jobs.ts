import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 发送初始数据
    const jobs = await prisma.job.findMany();
    res.write(`data: ${JSON.stringify(jobs)}\n\n`);

    // 设置定时器以定期检查新任务
    const interval = setInterval(async () => {
      const updatedJobs = await prisma.job.findMany();
      res.write(`data: ${JSON.stringify(updatedJobs)}\n\n`);
    }, 5000);

    // 当连接关闭时清理定时器
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newJob = await prisma.job.create({
        data: { title, description },
      });
      res.status(201).json(newJob);
    } catch (error) {
      console.error('创建新任务时出错:', error);
      res.status(500).json({ message: '创建新任务时出错' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`方法 ${req.method} 不被允许`);
  }
}
