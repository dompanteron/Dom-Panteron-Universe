import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dom Panteron Universe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "radial-gradient(circle at 20% 0%, #7F00FF 0%, #2B003D 42%, #050508 78%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#B266FF",
            marginBottom: 24
          }}
        >
          Dom Panteron
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 900
          }}
        >
          Jungle of style, sound, and conscious power
        </div>
        <div style={{ fontSize: 28, marginTop: 28, color: "rgba(255,255,255,0.75)" }}>
          Clothing · Music · Raffles
        </div>
      </div>
    ),
    { ...size }
  );
}
