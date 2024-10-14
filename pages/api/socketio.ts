import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Socket is initializing')
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('New client connected')

      socket.on('updateWorkItems', (data) => {
        socket.broadcast.emit('workItemsUpdated', data)
      })
    })
  }

  res.status(200).json({ message: 'Socket server is running' })
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default SocketHandler
