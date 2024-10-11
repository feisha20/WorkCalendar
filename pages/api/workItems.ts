import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from '@vercel/kv';

// 打印环境变量（仅用于调试，生产环境中请删除）
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL);
console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? '已设置' : '未设置');

// 初始化 KV 客户端
const kvClient = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 模拟数据存储
interface WorkItem {
  id: string;
  date: string;
  content: string;
  completed: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      res.status(200).json(workItems);
    } else if (req.method === 'POST') {
      const { date, content } = req.body;
      const newItem: WorkItem = {
        id: uuidv4(),
        date,
        content,
        completed: false,
      };
      
      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      workItems.push(newItem);
      await kvClient.set('workItems', workItems);
      
      // 通知所有客户端更新
      const io: SocketIOServer = (res.socket as any).server.io;
      if (io) {
        io.emit('workItemsUpdated', workItems);
      }
      
      res.status(201).json(newItem);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const { completed } = req.body;
      
      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      const updatedItems = workItems.map((item) =>
        item.id === id ? { ...item, completed } : item
      );
      await kvClient.set('workItems', updatedItems);
      
      // 通知所有客户端更新
      const io: SocketIOServer = (res.socket as any).server.io;
      if (io) {
        io.emit('workItemsUpdated', updatedItems);
      }
      
      res.status(200).json({ message: 'Item updated successfully' });
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (typeof id !== 'string') {
        return res.status(400).json({ error: '无效的任务ID' });
      }

      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      const updatedItems = workItems.filter(item => item.id !== id);
      
      if (workItems.length === updatedItems.length) {
        return res.status(404).json({ error: '未找到指定任务' });
      }

      await kvClient.set('workItems', updatedItems);
      
      // 通知所有客户端更新
      const io: SocketIOServer = (res.socket as any).server.io;
      if (io) {
        io.emit('workItemsUpdated', updatedItems);
      }
      
      res.status(200).json({ message: '任务已成功删除' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    console.error('Error in API route:', error);
    let errorMessage = '未知错误';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage,
      details: errorDetails
    });
  }
}