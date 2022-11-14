/* eslint-disable import/extensions */

// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from 'lit';
import ThreeDimensionVisualizer from './advantage-field-3d';

export default class Field3DElement extends HTMLElement {
  canvas: HTMLCanvasElement;
  viz: ThreeDimensionVisualizer;
  renderLoopId = 0;

  constructor() {
    super();

    this.canvas = document.createElement('canvas');
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(this.canvas);
    this.viz = new ThreeDimensionVisualizer(this.canvas);
    this.viz.render({
      poses: {
        robot: { position: [0, 0, 0], rotation: [0, 0, 0, 0] },
        green: [],
        blue: [],
        yellow: [],
      },
      options: {},
    });
    const updateLoop = () => {
      this.renderLoopId += 1;
      this.viz.render({
        poses: {
          robot: {
            position: [0, (this.renderLoopId % 270) / 10, 0],
            rotation: [0, 0, 0, 0],
          },
          green: [],
          blue: [],
          yellow: [],
        },
        options: {},
      });
      window.requestAnimationFrame(updateLoop);
    };
    window.requestAnimationFrame(updateLoop);
  }
  connectedCallback() {
    this.resized();
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  resized(): void {}
}
customElements.define('fwc-field-element', Field3DElement);
