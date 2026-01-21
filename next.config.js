/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
   productionBrowserSourceMaps: true,
  // Server runtime configuration
  serverRuntimeConfig: {
    // Increase the maximum header size to 32KB
    maxHeaderSize: 32 * 1024, // 32KB
  },
  
  // HTTP agent options
  httpAgentOptions: {
    keepAlive: true,
  },
  
  // For API routes configuration, use route segments config instead
  // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Keep the console output clean in development mode
    if (isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
  
  // Configure API routes to handle large requests
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },
  
  experimental: {
    // Enable larger response size limits
    largePageDataBytes: 128 * 1000, // 128KB (default is 128KB)
    serverComponentsExternalPackages: ['mongoose'],
  },
}

// For API route configurations in Next.js, use middleware or environment variables
// instead of the removed 'api' configuration object

module.exports = nextConfig
