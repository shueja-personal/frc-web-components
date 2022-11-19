/* eslint-disable no-console */
/* eslint-disable import/extensions */
import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { WebbitConfig } from '@webbitjs/webbit';
import Store, { SourceProvider } from '@webbitjs/store';
import Field3DElement from './field-element';
import FieldObject3DElement from './field-object';
import { Command } from './advantage-field-3d';

export const field3dConfig: Partial<WebbitConfig> = {
  properties: {
    title: { type: 'String' },
    description: { type: 'String' },
    provider: { type: 'SourceProvider', property: 'provider' },
    store: { type: 'Store', property: 'store' },
    sourceProvider: {
      type: 'String',
      attribute: 'source-provider',
      input: { type: 'None' },
    },
    sourceKey: {
      type: 'String',
      attribute: 'source-key',
      input: { type: 'None' },
    },
  },
};

@customElement('fwc-field-three')
export default class Field3D extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      width: 700px;
      height: 350px;
      justify-content: center;
      align-items: center;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: Boolean }) enabled = true;
  @property({ type: Object, attribute: false }) provider?: SourceProvider;
  @property({ type: Object, attribute: false }) store?: Store;
  @property({ type: String, attribute: 'source-provider' }) sourceProvider = '';
  @property({ type: String, attribute: 'source-key' }) sourceKey = '';
  fieldElement: Field3DElement = new Field3DElement();
  lastKeys: string[];
  childObjects: Map<string, FieldObject3DElement> = new Map();
  constructor() {
    super();
    this.lastKeys = [];

    this.fieldElement.style.width = '100%';
    this.fieldElement.style.height = '100%';
    const resizeObserver = new ResizeObserver(() => {
      this.resized();
    });

    resizeObserver.observe(this);
  }
  // eslint-disable-next-line class-methods-use-this
  isDoubleArray(arr: unknown): boolean {
    if (Array.isArray(arr)) {
      const isDoubleArray: boolean =
        arr.length > 0 && arr.every((value) => typeof value === 'number');

      return isDoubleArray; // 👉️ true
    }
    return false;
  }
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  updateFromSource(
    sourceValue: any,
    _parentKey: string,
    _sourceKey: string
  ): void {
    if (sourceValue['.type'] !== 'Field3d') {
      return;
    }
    const keys = Object.keys(sourceValue) as string[];
    // Here we add field objects that we haven't added from NT already
    let addedNew = false;
    keys.forEach((value) => {
      if (value.startsWith('.')) return; // Ignore meta-values
      if (!this.isDoubleArray(sourceValue[value])) return; // Ignore non-field-objects
      if (this.childObjects.has(value)) return; // Ignore existing field

      const newObject = new FieldObject3DElement();

      newObject.title = value;
      newObject.sourceProvider = this.sourceProvider;
      newObject.store = this.store;
      newObject.sourceKey = `${this.sourceKey}/${value}`;
      newObject.provider = this.provider;
      newObject.setAttribute('source-key', newObject.sourceKey);
      this.childObjects.set(value, newObject);
      this.appendChild(newObject);
      addedNew = true;
    });
    if (addedNew) {
      const command: Partial<Command> = { objects: [] };
      this.childObjects.forEach((value) => {
        command.objects?.push(value.getObject());
      });
      this.fieldElement.viz.render(command);
    }
  }

  updated(changedProperties: any): void {
    const { provider, store, sourceProvider, sourceKey } = this;
    if (!provider || !store || !sourceProvider || !sourceKey) {
      return;
    }
    console.log(changedProperties);
    store.subscribe(
      sourceProvider,
      sourceKey,
      (sourceValue, parentKey, key) => {
        this.updateFromSource(sourceValue, parentKey, key);
      },
      true
    );
  }

  resized(): void {
    console.log('resize');
    this.fieldElement.resized();
    this.requestUpdate();
  }

  render(): TemplateResult {
    return html` ${this.fieldElement} ${this.children}`;
  }
}
