/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  outputFileTracingRoot: process.cwd(),
  // Usa o nome atual do projeto tanto localmente quanto na publicação.
  basePath: '/VIZATI-Gerenciamento',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  devIndicators: false,
};

export default nextConfig;
