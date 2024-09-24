const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
    XRapidAPIKey: process.env.XRapidAPIKey
  },
  experimental: {
    runtime: 'edge',
  },
};

module.exports = nextConfig;
