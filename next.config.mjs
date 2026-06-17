/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Zorg dat het logo (gelezen via fs in de PDF-generator) meekomt in de
  // serverless-bundle van de orders-route op Vercel.
  experimental: {
    outputFileTracingIncludes: {
      '/api/orders': ['./public/vidre-logo.png'],
    },
  },
  // Headers voor PWA installeerbaarheid op iOS
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [{ key: 'Content-Type', value: 'application/manifest+json' }],
      },
      {
        // Service worker niet cachen, zodat updates altijd doorkomen.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
