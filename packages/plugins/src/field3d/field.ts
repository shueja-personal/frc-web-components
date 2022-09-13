/* eslint-disable import/extensions */
import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { WebbitConfig } from '@webbitjs/webbit';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Dashboard } from '@frc-web-components/dashboard';

export const field3dConfig: Partial<WebbitConfig> = {
  properties: {
    title: { type: 'String' },
    description: { type: 'String' },
  },
};

@customElement('fwc-field-three')
export default class Field3d extends LitElement {
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
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  cube: THREE.Mesh;
  _renderLoopId: number = 0;

  constructor() {
    super();
    const resizeObserver = new ResizeObserver(() => {
      this.resized();
    });

    resizeObserver.observe(this);

    const { width, height } = this.getBoundingClientRect();
    console.log(width, height);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.rotateSpeed = 2.0;
    this.controls.zoomSpeed = 0.5;
    this.controls.panSpeed = 2;
    this.controls.enableZoom = true;
    this.controls.enableDamping = false;

    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    );
    this.scene.add(this.cube);
    this.renderer.render(this.scene, this.camera);

    const _renderLoop = (): void => {
      if (this.parentNode) {
        this.renderer.render(this.scene, this.camera);
      }

      // update controls after the environment in
      // case the controls are retargeted
      this._renderLoopId = requestAnimationFrame(_renderLoop);
    };
    _renderLoop();
  }

  resized() {
    const { width, height } = this.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
    this.requestUpdate();
  }

  getCode(): string {
    return '<div>3</div>';
  }

  firstUpdated(): void {}

  render(): TemplateResult {
    return html` <div>${this.renderer.domElement}</div> `;
  }
}
