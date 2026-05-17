import { ImageResponse } from "next/og";
import { getCachedAnalysis } from "@/lib/cache";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

const HUB_NAVY = "#1B2A5E";
const HUB_ORANGE = "#F7941D";
const HUB_YELLOW = "#FFC72C";
const HUB_BG = "#F5F2EC";

export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  const result = await getCachedAnalysis(params.hash).catch(() => null);

  if (!result) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: HUB_BG,
            color: HUB_NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
          }}
        >
          Hub Solutions Audit
        </div>
      ),
      SIZE
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: HUB_BG,
          display: "flex",
          flexDirection: "column",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: HUB_NAVY,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: HUB_ORANGE,
              borderRadius: 999,
            }}
          />
          Hub Solutions Audit
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 52,
            color: HUB_NAVY,
            fontWeight: 700,
            letterSpacing: -1,
            display: "flex",
          }}
        >
          {result.host}
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 36,
            color: "#475569",
            display: "flex",
          }}
        >
          {result.era.verdict}
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 24,
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 28,
              padding: 28,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: 4,
                color: "#94a3b8",
              }}
            >
              UX score
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 120,
                fontWeight: 800,
                color: HUB_NAVY,
                lineHeight: 1,
                letterSpacing: -4,
                display: "flex",
              }}
            >
              {result.score.toFixed(1)}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: HUB_ORANGE,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {result.bracketLabel}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: HUB_NAVY,
              borderRadius: 28,
              padding: 28,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: 4,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              90-day forecast
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 56,
                fontWeight: 700,
                color: HUB_YELLOW,
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              {result.forecast.current.low}–{result.forecast.current.high} →{" "}
              {result.forecast.potential.low}–{result.forecast.potential.high}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 22,
                color: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            >
              leads per quarter, current vs. after revamp
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 18,
            color: "#94a3b8",
            display: "flex",
          }}
        >
          Run your own free audit at audit.hubsolutions.one
        </div>
      </div>
    ),
    SIZE
  );
}
