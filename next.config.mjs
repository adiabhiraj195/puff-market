/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_APOLLO_URL: process.env.NEXT_APOLLO_URL,
    PINATA_JWT: process.env.PINATA_JWT,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sapphire-keen-aardvark-438.mypinata.cloud",
        port: "",
        // pathname: "/account123/**",
      },
    ],
  },
  optimizeFonts: false,
};

export default nextConfig;
