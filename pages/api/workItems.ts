import type { NextApiRequest } from 'next';
import type { NextApiResponseServerIO } from '../../types/next';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@vercel/kv';

// 初始化 KV 客户端
const kvClient = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface WorkItem {
  id: string;
  date: string;
  content: string;
  completed: boolean;
}

// 在文件开头添加
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL)
console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set')

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  console.log('Received request:', req.method, req.url);
  try {
    if (req.method === 'POST') {
      console.log('Creating new work item');
      const { date, content } = req.body;
      const newItem: WorkItem = {
        id: uuidv4(),
        date,
        content,
        completed: false,
      };
      
      let workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      workItems.push(newItem);
      await kvClient.set('workItems', workItems);
      
      // 通知所有客户端更新
      if (res.socket.server.io) {
        console.log('Emitting workItemsUpdated event');
        res.socket.server.io.emit('workItemsUpdated', workItems);
      } else {
        console.log('Socket.IO not initialized');
      }
      
      res.status(201).json(newItem);
    } else if (req.method === 'GET') {
      // 处理 GET 请求
      console.log('Fetching work items');
      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      res.status(200).json(workItems);
    } else if (req.method === 'PUT') {
      console.log('Updating work item')
      const { id } = req.query;
      const { completed } = req.body;
      
      const workItems = await kvClient.get<WorkItem[]>('workItems') || [];
      const updatedItems = workItems.map((item) =>
        item.id === id ? { ...item, completed } : item
      );
      await kvClient.set('workItems', updatedItems);
      
      // 通知所有客户端更新
      if (res.socket.server.io) {
        res.socket.server.io.emit('workItemsUpdated', updatedItems);
      } else {
        console.log('Socket.IO not initialized')
      }
      
      res.status(200).json({ message: 'Item updated successfully' });
    } else if (req.method === 'DELETE') {
      console.log('Deleting work item')
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
      if (res.socket.server.io) {
        res.socket.server.io.emit('workItemsUpdated', updatedItems);
      } else {
        console.log('Socket.IO not initialized')
      }
      
      res.status(200).json({ message: '任务已成功删除' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in workItems API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
