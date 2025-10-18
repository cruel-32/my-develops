/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ['@repo/api', '@repo/db'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ React Compiler 활성화 (전체 모드)
  experimental: {
    // react compiler는 1.0 정식 버전인데 experimental?
    reactCompiler: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [new URL('http://localhost:9000/**')],
  },
  env: {
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
  },
};

export default nextConfig;
