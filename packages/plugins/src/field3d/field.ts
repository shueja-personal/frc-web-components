/* eslint-disable import/extensions */
import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { WebbitConfig } from '@webbitjs/webbit';
import Field3DElement from './field-element';

export const field3dConfig: Partial<WebbitConfig> = {
  properties: {
    title: { type: 'String' },
    description: { type: 'String' },
  },
};

@customElement('fwc-field-three')
export default class Field3D extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      width: 350px;
      height: 350px;
      justify-content: center;
      align-items: center;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: Boolean }) enabled = true;
  fieldElement: Field3DElement = new Field3DElement();
  constructor() {
    super();
    this.fieldElement.style.width = '100%';
    this.fieldElement.style.height = '100%';
    const resizeObserver = new ResizeObserver(() => {
      this.resized();
    });

    resizeObserver.observe(this);
  }

  resized(): void {
    console.log('resize');
    this.fieldElement.resized();
    this.requestUpdate();
  }

  render(): TemplateResult {
    return html` ${this.fieldElement} `;
  }
}
