import React from "react";
import { JSX } from "react";

type TRadarWithImageProps = {
  points: { x: number; y: number }[];
  radiusAxis: { cx: number; cy: number };
  imageUrl?: string;
  imageElement?: JSX.Element;
  strokeWidth?: number; // NEW: stroke width parameter
  uniqueId?: string; // to allow multiple instances
  debug?: boolean;
};

/**
   * Shrinks or expands a polygon by moving each vertex along the inward angle bisector.
   */
const offsetPoints = (
  pts: { x: number; y: number }[],
  offset: number
): { x: number; y: number }[] => {
  const len = pts.length;

  return pts.map((p, i) => {
    // Previous and next vertices
    const prev = pts[(i - 1 + len) % len];
    const next = pts[(i + 1) % len];

    // Vectors to previous and next
    const v1 = { x: prev.x - p.x, y: prev.y - p.y };
    const v2 = { x: next.x - p.x, y: next.y - p.y };

    const normalize = (v: typeof v1) => {
      const mag = Math.hypot(v.x, v.y);
      return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
    };

    const u1 = normalize(v1);
    const u2 = normalize(v2);

    // Bisector = normalized sum of directions
    const bisectorRaw = { x: u1.x + u2.x, y: u1.y + u2.y };
    const bisector = normalize(bisectorRaw);

    // Angle between edges (signed)
    const cross = u1.x * u2.y - u1.y * u2.x;
    const dot = u1.x * u2.x + u1.y * u2.y;
    const angle = Math.atan2(cross, dot);

    // For 2-point case: angle = π, sin(π/2) = 1
    const sinHalf = Math.sin(angle / 2);
    const safeSin = Math.sign(sinHalf) * Math.max(0.01, Math.abs(sinHalf));

    // Scale to ensure uniform width of offset path
    const scale = offset / safeSin;

    // Move against bisector to shrink; with bisector to expand
    return {
      x: p.x - bisector.x * scale,
      y: p.y - bisector.y * scale,
    };
  });
};

const makePath = (pts: { x: number; y: number }[]) =>
  pts.reduce(
    (acc, point, i) =>
      acc + (i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`),
    ""
    ) + "Z";

const RadarWithImage = ({
  points,
  radiusAxis,
  imageUrl,
  imageElement,
  strokeWidth = 3, // default stroke width
  uniqueId,
  debug,
}: TRadarWithImageProps) => {
  const { cx, cy } = radiusAxis;

  const halfStroke = strokeWidth / 2;

  let outerPath = "";
  let innerPath = "";

  if (points.length === 2) {
    // Handle 2-point line as a 4-point polygon (rectangle) for stroke band

    const [p0, p1] = points;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      // Degenerate case, fallback
      return null;
    }

    // Unit perpendicular vector
    const ux = -dy / length;
    const uy = dx / length;

    // Construct rectangle points offset by strokeWidth/2 perpendicular
    const polygonPts = [
      { x: p0.x + ux * halfStroke, y: p0.y + uy * halfStroke },
      { x: p1.x + ux * halfStroke, y: p1.y + uy * halfStroke },
      { x: p1.x - ux * halfStroke, y: p1.y - uy * halfStroke },
      { x: p0.x - ux * halfStroke, y: p0.y - uy * halfStroke },
    ];

    outerPath = makePath(polygonPts);
    innerPath = ""; // No inner path needed here for stroke band, or build a smaller rect

    // Use outerPath as clip and mask paths accordingly
  } else {
    outerPath = makePath(offsetPoints(points, -halfStroke));
    innerPath = makePath(offsetPoints(points, +halfStroke));
  }

  const imageWidth = Math.max(cx, cy) * 2.5;
  const imageHeight = imageWidth * (3 / 2);

  const imageX = cx - imageWidth / 2;
  const imageY = cy - imageHeight / 2;

  const renderImage = (extraProps: Partial<JSX.IntrinsicElements["image"]> = {}) =>
    imageElement ? (
      // Clone imageElement and apply extra props
      <foreignObject
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={imageHeight}
        {...extraProps}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {React.cloneElement(imageElement, {
            style: { ...(imageElement.props?.style || {}), ...(extraProps.style || {}), width: imageWidth, height: imageHeight },
          })}
        </div>
      </foreignObject>
    ) : imageUrl ? (
      <image
        href={imageUrl}
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={imageHeight}
        preserveAspectRatio="xMidYMid slice"
        {...extraProps}
      />
    ) : null;

  return (
    <>
      <defs>
        {/* Mask for stroke: white ring, hollow inside */}
        <mask id={`${(uniqueId || "")}_radarStrokeMask`}>
          <rect width="100%" height="100%" fill="black" />
          <path
            d={outerPath}
            fill="white"
          />
          <path
            d={innerPath}
            fill="black"
          />
        </mask>


        {/* Clip for the main radar fill */}
        <clipPath id={`${(uniqueId || "")}_radarClip`}>
          <path
            d={outerPath}
          />
        </clipPath>

      </defs>

      {/* Debug outlines for development */}
      {debug && (
        <>
          <path d={outerPath} stroke="lime" strokeWidth={1} fill="none" />
          <path d={innerPath} stroke="red" strokeWidth={1} fill="none" />
        </>
      )}

      {/* Fill inside shape with opacity */}
      {renderImage({ clipPath: `url(#${uniqueId}_radarClip)`, opacity: 0.5 })}

      {/* Stroke band */}
      {renderImage({ mask: `url(#${uniqueId}_radarStrokeMask)`, opacity: 1 })}
    </>
  );
};

export default RadarWithImage;
