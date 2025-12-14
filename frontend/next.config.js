/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  turbopack: {
    // Empty config to use default Turbopack behavior
  },
}

module.exports = nextConfig

