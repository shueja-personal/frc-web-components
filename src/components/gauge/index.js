import { html, css } from '@webbitjs/webbit';
import Container from '../container';
import Gauge from 'svg-gauge';

class GaugeWebbit extends Container {

  static get metadata() {
    return {
      displayName: 'Gauge',
      category: 'Charts & Graphs',
      //description: 'Component for displaying data from a 3-axis accelerometer.',
      documentationLink: 'https://frc-web-components.github.io/components/gauge/'
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        .gauge-container-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gauge-container {
          display: block;
        }
        
        .gauge-container > .gauge > .dial {
          stroke: #ddd;
          stroke-width: 3;
          fill: rgba(0,0,0,0);
        }
        .gauge-container > .gauge > .value {
          stroke: rgb(47, 180, 200);
          stroke-width: 3;
          fill: rgba(0,0,0,0);
        }
        .gauge-container > .gauge > .value-text {
          fill: black;
          font-family: sans-serif;
          font-size: 1em;
        }
      `
    ];
  }

  static get properties() {
    return {
      ...super.properties,
      min: { 
        type: Number, 
        get() {
          return Math.min(this._min, this._max);
        }
      },
      max: { 
        type: Number, 
        get() {
          return Math.max(this._min, this._max);
        }
      },
      value: { type: Number, primary: true }
    }
  }

  constructor() {
    super();
    this.width = '200px';
    this.height = '200px';
    this.min = 0;
    this.max = 100;
    this.value = 0;
    this.gauge = null;
  }

  setSize() {
    const rect = this.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;

    const size = Math.min(svgWidth, svgHeight);
    this.shadowRoot.getElementById('gauge').style.width = size + 'px';
  }

  gaugeInit() {
    const gaugeElement = this.shadowRoot.getElementById('gauge');
    gaugeElement.innerHTML = '';

    this.gauge = Gauge(gaugeElement, {
      min: this.min,
      max: this.max,
      value: 0
    });

    this.setSize();
};

  firstUpdated() {
    this.gaugeInit();
  }

  resized() {
    this.setSize();
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('min') || changedProperties.has('max')) {
      this.gaugeInit();
    }
    this.gauge.setValue(this.value);
  }

  render() {
    return html`
      <div class="gauge-container-container">
        <div id="gauge" class="gauge-container"></div>
      </div>
    `;
  }
}

webbitRegistry.define('frc-gauge', GaugeWebbit);