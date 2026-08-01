/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kendi kendine yeten, küçük production imajı için (Docker/standalone).
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
