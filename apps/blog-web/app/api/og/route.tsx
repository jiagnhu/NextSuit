import { ImageResponse } from "next/og";

import { siteName } from "@/lib/seo";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title")?.trim() || siteName;
  const subtitle =
    searchParams.get("subtitle")?.trim() ||
    "Portfolio-grade SaaS blog demo with real content and subscriber flow.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(125deg, #173f3a 0%, #23645d 55%, #94620f 100%)",
          color: "#f8f6f2",
          padding: "74px"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-40px",
            width: "300px",
            height: "300px",
            borderRadius: "999px",
            background: "rgba(217, 119, 6, 0.28)",
            filter: "blur(22px)"
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "fit-content",
            gap: "12px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.28)",
            padding: "8px 14px",
            fontSize: 28
          }}
        >
          <span>NS</span>
          <span>{siteName}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "90%"
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.04 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.92 }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
