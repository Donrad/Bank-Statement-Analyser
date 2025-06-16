import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse']
};

export default nextConfig;
