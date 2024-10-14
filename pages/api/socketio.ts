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
    transports: ['websocket'],
    cors: {
      origin: '*',
    },
  })
  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    socket.on('updateWorkItems', (data) => {
      console.log('Received updateWorkItems event:', data)
      io.emit('workItemsUpdated', data)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
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
