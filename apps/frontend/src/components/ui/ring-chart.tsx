import React from 'react';
import { cn } from '@/utils/classnames';

interface Segment {
  value: number;
  colorClass: string;
}

export interface RingChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
}

export function RingChart({
  segments,
  size = 120,
  strokeWidth = 12,
}: RingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      {segments.map((seg, i) => {
        const length = (seg.value / 100) * circumference;
        const circle = (
          <circle
            key={i}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            strokeWidth={strokeWidth}
            className={cn(seg.colorClass, 'transition-all')}
            strokeDasharray={`${length} ${circumference}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += length;
        return circle;
      })}
    </svg>
  );
}

export default RingChart;
