import {
  LitElement, html, css, TemplateResult,
} from 'lit';
// eslint-disable-next-line import/extensions
import { customElement, state } from 'lit/decorators.js';
import { WebbitConfig } from '@webbitjs/webbit';
import { dashboardProvider } from '../context-providers';
import './top-drawer-tabs';
import './bottom-drawer-tabs';
import FrcDashboard from '../frc-dashboard';
import getElementHtml from './get-element-html';

interface DashboardElement {
  selector: string;
  name: string;
}

@customElement('dashboard-drawer')
export default class DashboardDrawer extends LitElement {
  @state() dashboard?: FrcDashboard;
  @state() element?: HTMLElement;
  @state() groups: string[] = [];
  @state() newElementSelector?: string;
  @state() selectedGroup = 'My Elements';

  static styles = css`
    :host {
      display: block;
    }

    .dashboard {
      display: flex;
    }
    
    .sidebar {
      font-family: sans-serif;
      width: 220px;
      height: 100vh;
      background: #444;
      padding: 20px 15px;
      display: flex;
      flex-direction: column;
      overflow: auto;
      box-sizing: border-box;
      color: white;
    }
    
    .sidebar header {
      text-transform: uppercase;
      margin-bottom: 10px;
      font-size: 18px;
      color: lightblue;
    }
    
    .sidebar p {
      margin: 0 0 5px;
      cursor: pointer;
    }
    
    .sidebar p:hover {
      font-weight: bold;
    }
    
    .sidebar p.selected {
      font-weight: bold;
      text-decoration: underline;
      cursor: default;
    }
    
    .editors {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 370px;
      gap: 10px;
      font-family: sans-serif;
      padding: 15px 10px;
      background: rgb(240, 240, 240);
      box-sizing: border-box;
    }
    
    .editors header {
      font-weight: bold;
    }
    
    .group-selector {
      margin-bottom: 10px;
      padding: 3px 1px;
      font-size: 16px;
    }
  `;

  constructor() {
    super();
    dashboardProvider.addConsumer(this);
  }

  get #selectedElement(): HTMLElement | null {
    return this.dashboard?.getSelectedElement() ?? null;
  }

  updateElement(): void {
    const selector = this.newElementSelector;
    if (!this.dashboard || !selector) {
      return;
    }
    // if (!this.element || !this.dashboard || !this.newElementSelector) {
    //   return;
    // }
    // this.element.appendChild(this.dashboard.getRootElement());
    // this.dashboard?.getRootElement().childNodes.forEach(node => node.remove());
    // const element = document.createElement(this.newElementSelector);
    // this.dashboard?.getRootElement().appendChild(element);
    // this.dashboard.setSelectedElement(element);
    const container = document.createElement('div');
    container.innerHTML = getElementHtml(this.dashboard.getConnector(), selector);
    [...container.children].map(child => {
      // if (!this._slot) {
      //   child.removeAttribute('slot');
      // } else {
      //   child.setAttribute('slot', this._slot);
      // }
      this.#selectedElement?.append(child);
      return child;
    });
  }

  setNewElementSelector(): void {
    this.newElementSelector = this.getElements()[0].selector;
  }

  updateOnDashboardChange(): void {
    this.groups = this.getGroups();
  }

  updateOnGroupsChange(): void {
    if (!this.groups.includes(this.selectedGroup)) {
      this.selectedGroup = this.groups[0] ?? '';
    }
  }

  updateOnSelectedGroupChange(): void {
    const selectedElementGroup = this.getElementConfig()?.group ?? this.groups[0];
    if (selectedElementGroup !== this.selectedGroup) {
      this.newElementSelector = this.getElements()[0].selector;
    }
  }

  getGroups(): string[] {
    const { dashboard } = this;
    if (!dashboard) {
      return [];
    }
    const selectors = dashboard.getConnector().getElementConfigSelectors();
    const groups: string[] = selectors
      .filter(selector => {
        const config = dashboard.getConnector().getElementConfig(selector);
        return config?.dashboard.topLevel;
      })
      .map(selector => {
        const config = dashboard.getConnector().getElementConfig(selector);
        if (!config) {
          return '';
        }
        return config.group;
      });
    return [...new Set(groups)].filter(group => group !== '').sort();
  }

  firstUpdated(): void {
    if (this.dashboard) {
      this.updateOnDashboardChange();
      this.dashboard.subscribe('elementSelect', () => {
        this.requestUpdate();
      });
    }
  }

  updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has('newElementSelector')) {
      this.updateElement();
    }
    if (changedProps.has('element')) {
      this.setNewElementSelector();
    }
    if (changedProps.has('dashboard')) {
      this.updateOnDashboardChange();
    }
    if (changedProps.has('groups')) {
      this.updateOnGroupsChange();
    }
    if (changedProps.has('selectedGroup')) {
      this.updateOnSelectedGroupChange();
    }
  }

  getElementConfig(): WebbitConfig | undefined {
    return this.dashboard?.getConnector().getMatchingElementConfig(this.element);
  }

  getElements(): DashboardElement[] {
    const { dashboard } = this;
    if (!dashboard) {
      return [];
    }
    const selectors = dashboard.getConnector().getElementConfigSelectors();
    return selectors
      .filter(selector => {
        const config = dashboard.getConnector().getElementConfig(selector);
        if (!config) {
          return false;
        }
        return config.group === this.selectedGroup && config.dashboard.topLevel;
      })
      .map(selector => ({
        selector,
        name: dashboard.getSelectorDisplayName(selector),
      }))
      .sort((el1, el2) => el1.name.localeCompare(el2.name));
  }

  // eslint-disable-next-line class-methods-use-this
  render(): TemplateResult {
    if (!this.dashboard) {
      return html``;
    }
    return html`
      <div class="dashboard">
        <div class="sidebar">
          <header>Elements</header>
          <select class="group-selector" @change=${(ev: any) => {
        this.selectedGroup = ev.target.value;
        }}>
            ${this.groups.map(group => html`
            <option value=${group} selected=${group === this.selectedGroup}>${group}</option>
            `)}
          </select>
          ${this.getElements().map(({ selector, name }) => html`
          <p class=${this.newElementSelector === selector ? 'selected' : ''} key=${selector} @click=${() => {
          this.newElementSelector = selector;
          }}
            >
            ${name}
          </p>
          `)}
        </div>
        <div class="editors">
          <div>
            <header>Properties</header>
            <dashboard-properties-editor .dashboard=${this.dashboard}></dashboard-properties-editor>
          </div>
          <div>
            <header>Sources</header>
            <dashboard-sources-editor .dashboard=${this.dashboard}></dashboard-sources-editor>
          </div>
        </div>
      </div>
    `;
  }
}
