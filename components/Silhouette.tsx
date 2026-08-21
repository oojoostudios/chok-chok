import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, DEFAULT_ICON, familyOf, type IconId, type Family } from '../data/containerIcons';

// Renders a container silhouette. Pass either a specific icon id OR a family
// (falls back to that family's default icon). Color is applied as fill.
export default function Silhouette({
  icon,
  family,
  color,
  size = 64,
  strokeBump = false,
}: {
  icon?: IconId;
  family?: Family;
  color: string;
  size?: number;
  strokeBump?: boolean; // for tiny sizes: use a slightly stronger color upstream
  }) {
  const id: IconId = icon ?? (family ? DEFAULT_ICON[family] : 'bottle-1');
  const paths = ICON_PATHS[id] ?? ICON_PATHS['bottle-1'];
  // viewBox is 110x135; keep aspect ratio
  const w = size;
  const h = size * (135 / 110);
  return (
    <Svg width={w} height={h} viewBox="0 0 110 135" fill="none">
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

export { familyOf };
