import React, { useState } from 'react';
import { cn } from '@/utils/classnames';

interface Segment {
  value: number;
  colorClass: string;
  label: string;
  count: number;
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
  const [hovered, setHovered] = useState<number | null>(null);

  let offset = 0;
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      {hovered !== null && (
        <div className="absolute left-1/2 -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2 py-1 text-xs shadow">
          {segments[hovered].label}: {segments[hovered].count}
        </div>
      )}
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
              strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
              className={cn(seg.colorClass, 'transition-all cursor-pointer')}
              strokeDasharray={`${length} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
    </div>
  );
}

export default RingChart;
