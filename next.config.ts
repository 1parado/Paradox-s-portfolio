import type { NextConfig } from 'next';

const repoName = 'Paradox-s-portfolio';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}`,
};

export default nextConfig;
