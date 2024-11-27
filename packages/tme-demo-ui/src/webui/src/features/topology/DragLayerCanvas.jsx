import React from 'react';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getDimensions } from './topologySlice';


export const isSafari = !!window.safari;

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


const mapStateToProps = (state) => ({ dimensions: getDimensions(state) });

class DragLayerCanvas extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { ratio: 1 };
    this.ctx = null;
  }

  componentDidMount() {
    this.ctx = this.props.canvasRef.current.getContext('2d');
    this.setState({ ratio: getCanvasPixelRatio(this.ctx) });
  }

  componentDidUpdate() {
    const ratio = getCanvasPixelRatio(this.ctx);
    if (ratio !== this.state.ratio) {
      this.setState({ ratio: ratio });
    }
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  render() {
    console.debug('DragLayerCanvas Render');
    const { dimensions, canvasRef } = this.props;
    const { ratio } = this.state;
    return (
      <canvas
        className="canvas"
        ref={canvasRef}
        width={dimensions.width * ratio}
        height={dimensions.height * ratio}
        style={{
          width: dimensions.width,
          height: dimensions.height
        }}
      />
    );
  }
}

export default connect(mapStateToProps)(DragLayerCanvas);
