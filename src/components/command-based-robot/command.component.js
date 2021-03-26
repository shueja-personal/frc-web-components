import { html, css } from 'lit-element';
import { Webbit, define } from '../../webbit';
import { containerStyles } from '../styles';

class Command extends Webbit {

  static get dashboardConfig() {
    return {
      displayName: 'Robot Command',
      category: 'Command Based Robot',
    //   description: 'Component for displaying the state of a command based subsystem.',
    //   documentationLink: 'https://frc-web-components.github.io/components/basic-subsystem/',
      slots: [],
    };
  }

  static get styles() {
    return [
      containerStyles,
      css`
        :host {
          width: 100px;
          height: 50px;
        }

        [part=button] {
          width: 100%;
          height: 100%;
          margin: 0;
        }
      `
    ];
  }

  static get properties() {
    return {
      name: { type: String, defaultValue: 'Command' },
      running: { type: Boolean, defaultValue: false },
      controllable: { type: Boolean, defaultValue: false },
      isParented: { type: Boolean, defaultValue: false }
    };
  }

  onClick() {
    if (this.controllable) {
        this.running = !this.running;
    }
  }

  renderButton() {
    return html`   
      <vaadin-button 
        theme="${this.running == true ? 'primary' : ''} contrast"
        part="button"
        @click="${this.onClick}"
      >
        ${this.name}
      </vaadin-button>
    `;
  }

  render() {
    return html`
      ${this.renderButton()}
    `;
  }
}

define('frc-robot-command', Command);