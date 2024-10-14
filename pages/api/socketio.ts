import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from '../../types/next'

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Initializing Socket.IO')
  const io = new SocketIOServer(res.socket.server as any, {
    path: '/api/socketio',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'], // 添加 polling 作为备选
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })
  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })

  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err)
  })

  console.log('Socket is initialized')
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default SocketHandler
