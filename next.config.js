/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/socketio',
        destination: '/api/socketio',
      },
    ]
  },
}

module.exports = nextConfig
