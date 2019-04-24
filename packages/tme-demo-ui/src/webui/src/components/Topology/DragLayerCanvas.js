import React from 'react';
import { PureComponent } from 'react';

class DragLayerCanvas extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { ratio: 1 };
    this.ctx = null;
  }

  getCanvasPixelRatio(ctx) {
    const dpr = window.devicePixelRatio || 1;
    const bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
    return dpr / bsr;
  }

  componentDidMount() {
    this.ctx = this.props.canvasRef.current.getContext('2d');
    this.setState({ ratio: this.getCanvasPixelRatio(this.ctx) });
  }

  componentDidUpdate() {
    const ratio = this.getCanvasPixelRatio(this.ctx);
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

export default DragLayerCanvas;
