import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, DEFAULT_ICON, familyOf, type IconId, type Family } from '../data/containerIcons';

// The icon paths encode the container's *outline* as fill geometry — an outer
// contour plus inner contours that hollow it out, so a plain fill still reads
// as a line drawing. Dropping every subpath but the first leaves the outer
// contour alone, which fills as one solid shape.
function outerContourOnly(d: string): string {
  const first = d.indexOf('M', 1);
  return first === -1 ? d : d.slice(0, first).trimEnd();
}

// Renders a container silhouette. Pass either a specific icon id OR a family
// (falls back to that family's default icon). Color is applied as fill.
export default function Silhouette({
  icon,
  family,
  color,
  size = 64,
  strokeBump = false,
  opacity = 1,
  solid = false,
}: {
  icon?: IconId;
  family?: Family;
  color: string;
  size?: number;
  strokeBump?: boolean; // for tiny sizes: use a slightly stronger color upstream
  opacity?: number; // for oversized decorative use: drop it back to a color field
  solid?: boolean; // drop interior detail, leaving one filled shape
  }) {
  const id: IconId = icon ?? (family ? DEFAULT_ICON[family] : 'bottle-1');
  const raw = ICON_PATHS[id] ?? ICON_PATHS['bottle-1'];
  const paths = solid ? raw.map(outerContourOnly) : raw;
  // viewBox is 110x135; keep aspect ratio
  const w = size;
  const h = size * (135 / 110);
  return (
    <Svg width={w} height={h} viewBox="0 0 110 135" fill="none" opacity={opacity}>
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

export { familyOf };
