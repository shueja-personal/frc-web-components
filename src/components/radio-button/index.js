import { Webbit, html, css } from '@webbitjs/webbit';

class RadioButton extends Webbit {

  static get styles() {
    return css`
      :host {
        display: inline-block;
        font-family: sans-serif;
      }
    `;
  }

  static get properties() {
    return {
      checked: { type: Boolean, primary: true },
      value: { type: String },
      disabled: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.checked = false;
    this.value = '';
    this.disabled = false;
  }

  firstUpdated() {
    const styleAttributes = ['focus-ring', 'focused', 'empty'];
    const input = this.shadowRoot.querySelector('[part=radio-button-container]');

    var observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type == "attributes") {
          const { attributeName } = mutation;
          if (styleAttributes.includes(attributeName)) {
            const value = input.getAttribute(attributeName);
            if (value === null) {
              this.removeAttribute(attributeName, value);
            } else {
              this.setAttribute(attributeName, value);
            }
          }
        }
      });
    });

    observer.observe(input, {
      attributes: true
    });
  }

  onChange(ev) {
    const [target] = ev.path;
    this.checked = target.checked;
  }

  render() {
    return html`   
      <vaadin-radio-button
        part="radio-button-container"
        exportparts="radio, label"
        value="${this.value}" 
        ?checked="${this.checked}" 
        ?disabled="${this.disabled}"
        @checked-changed="${this.onChange}"
      >
        <slot></slot>
      </vaadin-radio-button>
    `;
  }
}

webbitRegistry.define('frc-radio-button', RadioButton);