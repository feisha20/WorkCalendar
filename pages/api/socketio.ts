import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log('Initializing Socket.IO')
    const io = new SocketIOServer((res.socket as any).server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    })
    ;(res.socket as any).server.io = io
  } else {
    console.log('Socket.IO already initialized')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default SocketHandler
