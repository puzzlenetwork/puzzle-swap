import React from 'react';

type ScalableArrowProps = React.SVGProps<SVGSVGElement> & {
  length: number;
  color?: string;
};

const ScalableArrow: React.FC<ScalableArrowProps> = ({ length, color = '#8082C5', ...rest }) => {
  const min = 41;
  const max = 75;
  const t = (length - min) / (max - min); // allow extrapolation beyond 0–1

  // Interpolation helper
  const lerp = (a: number, b: number) => a + (b - a) * t;

  // Match points from both SVGs (small: s, large: l)
  const points = {
    M: lerp(3.08, 3.1507),
    C1x1: lerp(2.1, 2.1482),
    C1x2: lerp(1.064, 1.08842),
    C1x3: lerp(0, 0),
    C2x1: lerp(1.064, 1.08842),
    C2x2: lerp(2.1, 2.1482),
    C2x3: lerp(3.08, 3.1507),
    H1: lerp(3.878, 3.96702),
    C3x1: lerp(3.43, 3.50873),
    C3x2: lerp(2.982, 3.05045),
    C3x3: lerp(2.534, 2.59217),

    RLineStart: lerp(37.546, 72.4078),
    RCtrl1: lerp(37.098, 71.9496),
    RCtrl2: lerp(36.65, 71.4913),
    RCtrl3: lerp(36.202, 71.033),
    RH1: lerp(37, 71.8493),
    RCurve1: lerp(37.98, 72.8518),
    RCurve2: lerp(39.016, 73.9116),
    RCurve3: lerp(40.08, 75),

    RH2: lerp(36.202, 71.033),
    RC2x1: lerp(36.65, 71.4913),
    RC2x2: lerp(37.112, 71.9639),
    RC2x3: lerp(37.546, 72.4078),

    BackLine: lerp(2.534, 2.59217),
    C4x1: lerp(2.968, 3.03613),
    C4x2: lerp(3.43, 3.50873),
    C4x3: lerp(3.878, 3.96702),
  };

  const d = `
    M${points.M} 5.999
    C${points.C1x1} 4.738 ${points.C1x2} 3.815 ${points.C1x3} 3.215
    V2.784
    C${points.C2x1} 2.184 ${points.C2x2} 1.261 ${points.C2x3} 0
    H${points.H1}
    C${points.C3x1} 1.076 ${points.C3x2} 1.907 ${points.C3x3} 2.446
    L${points.RLineStart} 2.446
    C${points.RCtrl1} 1.908 ${points.RCtrl2} 1.077 ${points.RCtrl3} 0
    H${points.RH1}
    C${points.RCurve1} 1.262 ${points.RCurve2} 2.185 ${points.RCurve3} 2.785
    V3.216
    C${points.RCurve2} 3.816 ${points.RCurve1} 4.739 ${points.RH1} 6
    H${points.RH2}
    C${points.RC2x1} 4.908 ${points.RC2x2} 4.077 ${points.RC2x3} 3.539
    L${points.BackLine} 3.538
    C${points.C4x1} 4.077 ${points.C4x2} 4.908 ${points.C4x3} 5.999
    H${points.M}
    Z
  `;

  return (
    <svg {...rest} width={length} height={6} viewBox={`0 0 ${length} 6`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={d} fill={color} />
    </svg>
  );
};

export default ScalableArrow;
