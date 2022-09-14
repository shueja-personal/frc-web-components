/* eslint-disable import/extensions */
import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GridHelper } from 'three';

export default class Field3DElement extends HTMLElement {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  grid: THREE.GridHelper;
  renderLoopId = 0;

  constructor() {
    super();

    const { width, height } = this.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 3;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);

    this.grid = new GridHelper(20, 20, 0x0ff00, 0x0000ff);
    this.scene.add(this.grid);
    this.camera.lookAt(this.grid.position);
    this.renderer.render(this.scene, this.camera);
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(this.renderer.domElement);

    const renderLoop = (): void => {
      if (this.parentNode) {
        this.renderer.render(this.scene, this.camera);
      }

      // update controls after the environment in
      // case the controls are retargeted
      this.renderLoopId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }
  connectedCallback() {
    this.resized();
  }

  resized(): void {
    console.log('innerResize');
    const { width, height } = this.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
  }
}
customElements.define('fwc-field-element', Field3DElement);
