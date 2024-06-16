/** @type {import('next').NextConfig} */
const nextConfig = {
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
  };
  
  export default nextConfig;
  
  
