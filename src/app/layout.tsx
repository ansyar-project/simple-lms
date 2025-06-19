import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "LMS - Learning Management System",
  description:
    "A comprehensive learning management system built with Next.js for modern education.",
  generator: "Next.js",
  applicationName: "LMS",
  referrer: "origin-when-cross-origin",
  keywords: [
    "LMS",
    "Learning Management System",
    "Online Courses",
    "Education",
    "Next.js",
    "React",
    "eLearning",
  ],
  authors: [{ name: "Ansyar" }],
  creator: "Ansyar",
  publisher: "Ansyar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://simple-lms.ansyar-world.top/",
    languages: {
      "en-US": "https://simple-lms.ansyar-world.top/en-US",
    },
  },
  openGraph: {
    title: "LMS - Learning Management System",
    description:
      "A comprehensive learning management system built with Next.js for modern education.",
    url: "https://simple-lms.ansyar-world.top/",
    siteName: "LMS",
    images: [
      {
        url: "https://simple-lms.ansyar-world.top/og-image.png",
        width: 1200,
        height: 630,
        alt: "LMS - Learning Management System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LMS - Learning Management System",
    description:
      "A comprehensive learning management system built with Next.js for modern education.",
    creator: "@yourtwitterhandle",
    images: ["https://simple-lms.ansyar-world.top/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData
          schema={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "LMS - Learning Management System",
            url: "https://simple-lms.ansyar-world.top/",
            description:
              "A comprehensive learning management system built with Next.js for modern education.",
            publisher: {
              "@type": "Organization",
              name: "Ansyar",
              url: "https://simple-lms.ansyar-world.top/",
              logo: {
                "@type": "ImageObject",
                url: "https://simple-lms.ansyar-world.top/og-image.png",
                width: 1200,
                height: 630,
              },
            },
          }}
        />
        <StructuredData
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Ansyar",
            url: "https://simple-lms.ansyar-world.top/",
            logo: {
              "@type": "ImageObject",
              url: "https://simple-lms.ansyar-world.top/og-image.png",
              width: 1200,
              height: 630,
            },
          }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="skip-to-content-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
