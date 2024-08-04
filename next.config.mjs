import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Enable SWC minification for faster builds

  // Headers configuration
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'X-Forwarded-Proto', value: 'https' },
        ],
      },
    ];
  },

  // Asset prefix for serving assets via CDN in production
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.aviatorgm.com' : '',

  // Image optimization configuration
  images: {
    domains: ['aviatorgm.com'],
  },

  // Webpack configuration
  webpack(config, { isServer }) {
    // Add any custom webpack configuration here

    // Example: Bundle Analyzer
    if (process.env.ANALYZE) {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: process.env.ANALYZE === 'true',
        }))()
      );
    }

    return config;
  },

  // Enabling gzip compression
  compress: true,
};

// Export the configuration with bundle analyzer enabled conditionally
export default (phase) => {
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  // Enable bundle analyzer in production build
  if (isProd) {
    return withBundleAnalyzer({
      enabled: process.env.ANALYZE === 'true',
    })(nextConfig);
  }

  return nextConfig;
};
