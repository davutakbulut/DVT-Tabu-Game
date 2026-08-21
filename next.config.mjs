/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['framer-motion', 'lucide-react', 'canvas-confetti'],
};

export default nextConfig;
