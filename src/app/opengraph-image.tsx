import { ImageResponse } from "next/og";

export const alt = "Repton Digital: custom websites, AI automation and custom software for Perth businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview image, drawn in code so no image file needs maintaining. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #060b16 0%, #0b1d3d 60%, #0c3a63 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 999,
              background: "#0ea5e9",
              color: "#060b16",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            R
          </div>
          Repton Digital
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.04 }}>
            Custom websites. Powerful software. Built for Perth.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#a9b4c8" }}>
            Websites, AI automation and custom software
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
