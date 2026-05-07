/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@webcontainer/api'],
  // COOP + COEP for WebContainers are set in middleware only under /learn/coding/*
  webpack: (config, { isServer }) => {
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
