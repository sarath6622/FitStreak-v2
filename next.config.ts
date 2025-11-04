import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public", // service worker files will be generated here
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disable in dev
    fallbacks: {
    document: "/offline", // 👈 this tells it to serve offline page
  }
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

module.exports = withPWA(nextConfig);