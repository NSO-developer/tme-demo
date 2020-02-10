export function pointAlongLine(x1, y1, x2, y2, n) {
  const d = lineLength({ x1, y1, x2, y2 });
  if (d > n) {
    const r = n / d;
    const x = r * x2 + (1 - r) * x1;
    const y = r * y2 + (1 - r) * y1;
    return { x, y };
  } else {
    return { x: x2, y: y2 };
  }
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

export const roundPc = (n) =>
  +Number.parseFloat(n).toFixed(2);

export const safeRound = (n) =>
  Math.min(1, Math.max(0, Number.parseFloat(n).toFixed(4))).toString();

export const pxCoordToSafePc = (x, y, layoutContainer, dimensions) => {
  const { left, top, width, height } = layoutContainer.pc;
  const { pcX, pcY } = pxToPc(restrictPos(x, y, layoutContainer), dimensions);
  return { x: safeRound((pcX - left) / width),
           y: safeRound((pcY - top) / height) };
};

export const isSafari = !!window.safari;

export const getCanvasPixelRatio = ctx => {
  const dpr = window.devicePixelRatio || 1;
  const bsr =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  return dpr / bsr;
};

export const connectPngDragPreview = (imageMarkup, size, connect, centred) => {
  const svgImg = new Image();
  const canvasImg = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const ratio = isSafari ? getCanvasPixelRatio(ctx) : 1;
  canvas.width = size * ratio;
  canvas.height = size * ratio;

  svgImg.src = `data:image/svg+xml,${encodeURIComponent(imageMarkup)}`;

  svgImg.onload = () => {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.drawImage(svgImg, 0, 0);
    canvasImg.src=(canvas.toDataURL('image/png'));
  };

  canvasImg.onload = () => {
    connect(canvasImg,
      centred && { offsetX: size/2, offsetY: size/2 + (isSafari ? size : 0) });
  };
};

export const getCssVariable = name =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);


export const safeKey = key =>
  (key.includes(' ') && !key.includes('"')) ? `"${key}"` : key;
