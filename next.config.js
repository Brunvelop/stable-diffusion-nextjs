/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["ordinals.com", "ordin.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
