/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite que o WebSocket de desenvolvimento aceite conexões do seu IP local
  experimental: {
    allowedDevOrigins: ["192.168.100.26:3000", "localhost:3000"],
  },
};

module.exports = nextConfig;
