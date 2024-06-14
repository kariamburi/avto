/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
module.exports = {
    async headers() {
      return [
        {
          // matching all API routes
          source: "/api/:path*",
          headers: [
            { key: "X-Forwarded-Proto", value: "https" }
          ]
        }
      ]
    }
  }
  
