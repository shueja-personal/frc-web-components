import { html, css, LitElement } from 'lit';

export const elementName = 'frc-toggle-switch';

export const elementConfig = {
  dashboard: {
    displayName: 'Toggle Switch',
  },
  properties: {
    toggled: { type: Boolean, primary: true, changeEvent: 'toggle' }
  }
};

class ToggleSwitch extends LitElement {

  static styles = css`
    :host {
      display: inline-block;
      width: 60px;
      height: 34px;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 100%;
      height: 100%;
      margin-bottom: 0;
    }
    .switch input { 
      opacity: 0;
      width: 0;
      height: 0;
    }
    [part=switch] {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
    }
    [part=knob] {
      position: absolute;
      display: inline-block;
      content: "";
      height: var(--circle-height);
      width: var(--circle-width);
      left: var(--circle-top);
      top: var(--circle-top);
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + [part=switch] {
      background-color: #2196F3;
    }
    input:focus + [part=switch] {
      box-shadow: 0 0 1px #2196F3;
    }
    input:checked + [part=switch] [part=knob] {
      transform: translateX(var(--circle-translate-x));
    }
  `;

  static properties = elementConfig.properties;

  constructor() {
    super();
    this.toggled = false;
  }

  firstUpdated() {
    const observer = new ResizeObserver(() => this.resized());
    observer.observe(this);
  }

  resized() {
    this.rect = this.getBoundingClientRect();
    const { width, height } = this.rect;
    const slider = this.shadowRoot.querySelector('[part=switch]');
    slider.style.borderRadius = `${width}px`;
    slider.style.setProperty('--circle-width', `${height * .8}px`);
    slider.style.setProperty('--circle-height', `${height * .8}px`);
    slider.style.setProperty('--circle-left', `${width / 2 - height * .8}px`);
    slider.style.setProperty('--circle-top', `${height * .1}px`);
    slider.style.setProperty('--circle-translate-x', `${width - height}px`);
  }

  onClick() {
    this.toggled = !this.toggled;
    const event = new CustomEvent('toggle', {
      detail: {
        toggled: this.toggled
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`   
        <label class="switch" @click="${this.onClick}">
          <input type="checkbox" .checked="${this.toggled}" disabled />
          <span part="switch">
            <span part="knob"></span>
          </span>
        </label>
      `;
  }
}

customElements.define(elementName, ToggleSwitch);