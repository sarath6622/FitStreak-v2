import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public", // service worker files will be generated here
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disable in dev
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);