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
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new SocketIOServer(res.socket.server as any)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('New client connected')

      socket.on('updateWorkItems', (data) => {
        socket.broadcast.emit('workItemsUpdated', data)
      })
    })
  }
  res.end()
}

export default SocketHandler