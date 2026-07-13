import styled from "@emotion/styled";
import React from "react";

const Slice = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/**
 * clip-path polygon for slice `index` of `total`. Two logos keep the classic
 * vertical left/right split; three or more are cut into equal pie wedges. The
 * parent clips to a circle/rounded box, so the wedges' straight outer edges are
 * trimmed to the icon shape.
 */
function slicePolygon(index: number, total: number): string {
  if (total === 2) {
    return index === 0
      ? "polygon(0 0, 50% 0, 50% 100%, 0 100%)"
      : "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)";
  }
  const step = 360 / total;
  const start = -90 + index * step;
  const end = start + step;
  const points: string[] = ["50% 50%"];
  const SEGMENTS = 6;
  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = ((start + ((end - start) * i) / SEGMENTS) * Math.PI) / 180;
    const x = 50 + 100 * Math.cos(angle);
    const y = 50 + 100 * Math.sin(angle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

interface TokenLogoSlicesProps {
  logos: string[];
  alt?: string;
}

const TokenLogoSlices: React.FC<TokenLogoSlicesProps> = ({ logos, alt }) => (
  <>
    {logos.map((logo, index) => (
      <Slice
        key={`${logo}-${index}`}
        src={logo}
        alt={alt}
        style={{ clipPath: slicePolygon(index, logos.length) }}
      />
    ))}
  </>
);

export default TokenLogoSlices;
