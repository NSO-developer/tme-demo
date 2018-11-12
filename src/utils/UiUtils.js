export function pointAlongLine(x1, y1, x2, y2, n) {
  const d = lineLength({ x1, y1, x2, y2 });
  const r = n / d;
  const x = r * x2 + (1 - r) * x1;
  const y = r * y2 + (1 - r) * y1;
  return { x, y };
}

export function lineLength({ x1, y1, x2, y2 }) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

export function lineAngle({ x1, y1, x2, y2 }) {
  const theta = Math.atan2(y2 - y1, x2 - x1);
  const angle = theta * 180 / Math.PI;
  if (angle < 0) {
    return angle + 360;
  } else {
    return angle;
  }

}

export function pxToPc({ x, y }, dimensions) {
  const { width, height } = dimensions;
  return {
    pcX: x / width * 100,
    pcY: y / height * 100
  };
}

export function restrictPos(x, y, layoutContainer) {
  const { left, right, top, bottom } = layoutContainer.px;
  return {
    x: Math.max(left, Math.min(right, x)),
    y: Math.max(top, Math.min(bottom, y))
  };
}
