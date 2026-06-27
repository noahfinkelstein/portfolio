/**
 * ============================================================================
 *  NEXT.JS CONFIG  —  framework-level settings.
 * ============================================================================
 *
 * You almost never need to edit this. Two things you MIGHT change someday:
 *   - images.remotePatterns: if you load photos from an external CDN URL
 *   - eslint.ignoreDuringBuilds: set false if you add ESLint and want CI lint
 *
 * Local images in /public do NOT need remotePatterns.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // double-invoke effects in dev to catch bugs
  eslint: {
    // No ESLint config in this starter — don't block production builds on lint
    ignoreDuringBuilds: true,
  },
  images: {
    // External image hosts allowed for next/image optimization
    // Example: { protocol: 'https', hostname: 'images.unsplash.com' }
    remotePatterns: [],
  },
};

export default nextConfig;
