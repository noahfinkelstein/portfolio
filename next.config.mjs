/**
 * Next.js configuration.
 * You almost never need to touch this file. The two things you MIGHT change:
 *  - `images.remotePatterns`: add a domain here if you ever load photos from an
 *    external URL (e.g. an image CDN). Local photos in /public don't need this.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // We don't ship an ESLint config in this starter, so don't block builds
    // on linting. (TypeScript type-checking still runs and WILL fail builds.)
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow optimizing images served from these external hosts.
    // Add objects like { protocol: 'https', hostname: 'images.unsplash.com' }
    remotePatterns: [],
  },
};

export default nextConfig;
