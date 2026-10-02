/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parallel dev/build runs use their own output folder so they never clobber
  // each other: NEXT_DIST_DIR=.next-hero npx next dev -p 3101
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        // Cheap, safe hardening for every response. (Vercel adds HSTS itself.
        // No Content-Security-Policy: the no-flash theme script is inline.)
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        // The project recordings and photos change rarely and are a few MB:
        // let browsers keep them for a day instead of revalidating every view.
        source: "/(projects|images|linkedin)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    return [
      // Old links to /photos land on the home page.
      { source: "/photos", destination: "/", permanent: true },
      // The CV lives at /cv; old links to /experience land there.
      { source: "/experience", destination: "/cv", permanent: true },
    ];
  },
};

export default nextConfig;
