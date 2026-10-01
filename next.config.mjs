/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parallel dev/build runs use their own output folder so they never clobber
  // each other: NEXT_DIST_DIR=.next-hero npx next dev -p 3101
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      // The photos page was retired in v3; old links land on the home page.
      { source: "/photos", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
