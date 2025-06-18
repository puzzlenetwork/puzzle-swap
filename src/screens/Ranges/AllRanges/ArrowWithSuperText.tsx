import React, { useEffect, useRef, useState } from 'react';
import ScalableArrow from './ScalableArrow'; // Ensure this is the interpolating ScalableArrow component from earlier

type ArrowWithSuperTextProps = {
  children: React.ReactNode;
  color?: string;
};

const ArrowWithSuperText: React.FC<ArrowWithSuperTextProps> = ({ children, color }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [childWidth, setChildWidth] = useState<number>(60); // default fallback width

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setChildWidth(rect.width);
    }
  }, [children]);

  const arrowLength = childWidth + 20;

  return (
    <div style={{ display: 'inline-flex', position: 'relative', width: arrowLength, height: 6 }}>
      {/* ScalableArrow */}
      <ScalableArrow length={arrowLength} color={color} />

      {/* Positioned Child */}
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `50%`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ArrowWithSuperText;
