import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const RADIO_CONNECT_ORIGINS = [
  "https://playerservices.streamtheworld.com",
  "https://*.streamtheworld.com",
  "https://mdstrm.com",
  "https://*.mdstrm.com",
] as const;

const SERVICE_WORKER_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  `connect-src 'self' ${RADIO_CONNECT_ORIGINS.join(" ")}`,
  `media-src 'self' ${RADIO_CONNECT_ORIGINS.join(" ")} blob:`,
].join("; ");

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  reloadOnOnline: false,
  additionalPrecacheEntries: [
    { url: "/", revision: "pantalla-londres-v2" },
    { url: "/manifest.webmanifest", revision: "pantalla-londres-v2" },
    { url: "/icon.png", revision: "pantalla-londres-v2" },
    { url: "/icons/icon-192.png", revision: "pantalla-londres-v2" },
    { url: "/icons/icon-512.png", revision: "pantalla-londres-v2" },
    { url: "/icons/icon-maskable-512.png", revision: "pantalla-londres-v2" },
    { url: "/backgrounds/morning.webp", revision: "pantalla-londres-v2" },
    { url: "/backgrounds/day.webp", revision: "pantalla-londres-v2" },
    { url: "/backgrounds/evening.webp", revision: "pantalla-londres-v2" },
    { url: "/backgrounds/night.webp", revision: "pantalla-londres-v2" },
    { url: "/radio/tropicana.png", revision: "pantalla-londres-radio-v2" },
    { url: "/radio/caracol-radio.jpeg", revision: "pantalla-londres-radio-v2" },
    { url: "/radio/blue-radio.png", revision: "pantalla-londres-radio-v2" },
    { url: "/radio/olimpica.png", revision: "pantalla-londres-radio-v2" },
    { url: "/radio/la-fm.png", revision: "pantalla-londres-radio-v2" },
  ],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "screen-wake-lock=(self)",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: SERVICE_WORKER_CSP,
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
