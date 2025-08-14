import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withPWA = require('next-pwa')({
  dest: 'public', // sw.js and related files will go here
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // recommended: disables PWA in dev
});

module.exports = nextConfig;