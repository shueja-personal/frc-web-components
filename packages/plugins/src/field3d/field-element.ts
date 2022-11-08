/* eslint-disable import/extensions */

// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';
// eslint-disable-next-line import/no-extraneous-dependencies
import { GridHelper, Vector3 } from 'three';
import Field3DObject from './field-object';

export default class Field3DElement extends HTMLElement {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  grid: THREE.GridHelper;
  renderLoopId = 0;

  constructor() {
    super();

    const { width, height } = this.getBoundingClientRect();
    THREE.Object3D.DefaultUp = new Vector3(0, 0, 1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;
    this.camera.position.y = 0;
    this.camera.position.x = -3;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);

    this.grid = new GridHelper(20, 20, 0x0ff00, 0x0000ff);
    this.grid.rotateX(Math.PI / 2);
    this.scene.add(this.grid);
    this.camera.lookAt(this.grid.position);
    this.renderer.render(this.scene, this.camera);
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.append(this.renderer.domElement);

    const object = new Field3DObject(
      [
        { x: 1, y: 1, z: 1, qw: 0, qx: 0, qy: 0, qz: 1 },
        { x: 1, y: 1, z: 2, qw: 0, qx: 0, qy: 0, qz: 1 },
      ],
      'test',
      this.scene
    );

    const renderLoop = (): void => {
      object.setPoses([
        {
          x: (this.renderLoopId % 1000) / 1000,
          y: 1,
          z: 0,
          qw: 0,
          qx: 0,
          qy: 0,
          qz: 1,
        },
        { x: 1, y: 1, z: 2, qw: 0, qx: 0, qy: 0, qz: 1 },
      ]);
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
