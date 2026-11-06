import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Keep the dev badge clear of the sidebar's user menu.
  devIndicators: { position: "bottom-right" },
  // Lets a phone on the same Wi-Fi load the dev server (e.g. http://192.168.x.x:3000).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
}

export default nextConfig
