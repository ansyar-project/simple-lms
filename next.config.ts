import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow local images served through our API
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/api/files/**",
      },
      // Add your production domain here when deploying
      {
        protocol: "https",
        hostname: "your-domain.com", // Replace with your actual domain
        pathname: "/api/files/**",
      },
    ],
    // For files starting with /bucket-name/, use our API route
    loaderFile: undefined,
  },
  // Rewrite rules to handle file serving
  async rewrites() {
    return [
      // Rewrite /course-thumbnails/* to /api/files/course-thumbnails/*
      {
        source: "/course-thumbnails/:path*",
        destination: "/api/files/course-thumbnails/:path*",
      },
      // Rewrite /course-videos/* to /api/files/course-videos/*
      {
        source: "/course-videos/:path*",
        destination: "/api/files/course-videos/:path*",
      },
      // Rewrite /course-documents/* to /api/files/course-documents/*
      {
        source: "/course-documents/:path*",
        destination: "/api/files/course-documents/:path*",
      },
      // Rewrite /user-avatars/* to /api/files/user-avatars/*
      {
        source: "/user-avatars/:path*",
        destination: "/api/files/user-avatars/:path*",
      },
    ];
  },
};

export default nextConfig;
