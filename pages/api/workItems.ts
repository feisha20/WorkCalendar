import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Server as SocketIOServer } from 'socket.io';

// 模拟数据存储
interface WorkItem {
  id: string;
  date: string;
  content: string;
  completed: boolean;
}

let workItems: WorkItem[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(workItems);
  } else if (req.method === 'POST') {
    const { date, content } = req.body;
    const newItem: WorkItem = {
      id: uuidv4(),
      date,
      content,
      completed: false,
    };
    workItems.push(newItem);
    
    // 通知所有客户端更新
    const io: SocketIOServer = (res.socket as any).server.io;
    if (io) {
      io.emit('workItemsUpdated', workItems);
    }
    
    res.status(201).json(newItem);
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { completed } = req.body;
    const updatedItems = workItems.map((item) =>
      item.id === id ? { ...item, completed } : item
    );
    workItems = updatedItems;
    
    // 通知所有客户端更新
    const io: SocketIOServer = (res.socket as any).server.io;
    if (io) {
      io.emit('workItemsUpdated', workItems);
    }
    
    res.status(200).json({ message: 'Item updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}