/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@webcontainer/api'],
  // COOP + COEP for WebContainers are set in middleware only under /learn/coding/*
  webpack: (config, { dev, isServer }) => {
    // Avoid stale webpack chunk graphs in `next dev` (e.g. ENOENT ./331.js, a[d] is not a function).
    if (dev && !isServer) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    if (isServer) return config;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
};

export default nextConfig;
