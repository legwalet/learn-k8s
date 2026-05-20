/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@webcontainer/api'],
  // COOP + COEP for WebContainers are set in middleware only under /learn/coding/*
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Stale chunk graphs in `next dev` (ENOENT ./331.js, __webpack_modules__[id] is not a function).
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
