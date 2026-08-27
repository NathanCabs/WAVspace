import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/config/site-config";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: siteConfig.theme.hex.background,
          color: siteConfig.theme.hex.primary,
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        {siteConfig.cafe.name.charAt(0)}
      </div>
    ),
    size,
  );
}
