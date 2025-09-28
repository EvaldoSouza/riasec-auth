import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js that your application lives under the /riasec360 path
  basePath: '/riasec360',

  // Ensures that static assets (CSS, JS, images) also use this path
  assetPrefix: '/riasec360',
  
};

export default nextConfig;

