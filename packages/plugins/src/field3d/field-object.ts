/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { WebbitConfig } from '@webbitjs/webbit';
import Store, { SourceProvider } from '@webbitjs/store';
import * as THREE from 'three';
import {
  BoxGeometry,
  BufferGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// eslint-disable-next-line camelcase
import { Config3dRobot, Config3d_Rotation } from './FRCData';
import { convert } from './units';

export const field3dObjectConfig: Partial<WebbitConfig> = {
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

@customElement('fwc-field-object-three')
export default class FieldObject3DElement extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: String }) view = 'Cube';
  @property({ type: Boolean }) enabled = true;
  @property({ type: Object, attribute: false }) provider?: SourceProvider;
  @property({ type: Object, attribute: false }) store?: Store;
  @property({ type: String, attribute: 'source-provider' }) sourceProvider = '';
  @property({ type: String, attribute: 'source-key' }) sourceKey = '';
  coneMesh: THREE.InstancedMesh;
  robotMesh: THREE.InstancedMesh;
  private displayedMesh: THREE.InstancedMesh;
  private coneTexture: THREE.Texture;
  private coneTextureBase: THREE.Texture;
  private MAX_INSTANCE_COUNT = 500;
  private robot3dConfig: Config3dRobot;

  constructor() {
    super();

    this.robot3dConfig = {
      title: 'Robot',
      path: '/models/Robot_KitBot.glb',
      rotations: [{ axis: 'z', degrees: 90 }],
      position: [0.12, 3.15, 0],
      cameras: [
        {
          name: 'Front Camera',
          rotations: [{ axis: 'y', degrees: 20 }],
          position: [0.2, 0, 0.8],
          resolution: [960, 720],
          fov: 100,
        },
        {
          name: 'Back Camera',
          rotations: [
            { axis: 'y', degrees: 20 },
            { axis: 'z', degrees: 180 },
          ],
          position: [-0.2, 0, 0.8],
          resolution: [960, 720],
          fov: 100,
        },
      ],
    };
    // Setup for cone mesh option
    {
      const loader = new THREE.TextureLoader();
      this.coneTexture = loader.load('/textures/cone-green.png');
      this.coneTexture.offset.set(0.25, 0);
      this.coneTextureBase = loader.load('/textures/cone-green-base.png');
    }
    const coneGeometry = new THREE.ConeGeometry(0.18, 0.75, 16, 32);
    coneGeometry.rotateZ(-Math.PI / 2);
    this.coneMesh = new THREE.InstancedMesh(
      coneGeometry,
      [
        new THREE.MeshPhongMaterial({
          map: this.coneTexture,
        }),
        new THREE.MeshPhongMaterial(),
        new THREE.MeshPhongMaterial({
          map: this.coneTextureBase,
        }),
      ],
      this.MAX_INSTANCE_COUNT
    );

    this.robotMesh = new THREE.InstancedMesh(
      new BoxGeometry(0.5, 0.5, 0.5, 1, 1),
      new MeshBasicMaterial({ color: '#ff00ff' }),
      this.MAX_INSTANCE_COUNT
    );
    this.displayedMesh = this.robotMesh;
    const robotConfig = this.robot3dConfig;
    const loader = new GLTFLoader();
    loader.load(robotConfig.path, (gltf) => {
      if (robotConfig === undefined) return;
      console.log(gltf.scene.children);
      const { geometry } = gltf.scene.children[0] as Mesh;
      geometry.applyQuaternion(
        this.getQuaternionFromRotSeq(robotConfig.rotations)
      );
      geometry.translate(...robotConfig.position);
      this.displayedMesh.geometry = geometry;
      this.displayedMesh.material = (gltf.scene.children[0] as Mesh).material;
      // Set position and rotation of model

      // Create group and add to scene
    });
  }

  getObject(): THREE.Object3D {
    return this.displayedMesh;
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

  // eslint-disable-next-line class-methods-use-this
  updateFromSource(
    sourceValue: any,
    _parentKey: string,
    sourceKey: string
  ): void {
    // Update position and rotation based on array
    if (!this.isDoubleArray(sourceValue)) return;

    if (sourceValue.length % 7 !== 0) return;

    // Resize array
    const dummyMatrix = new THREE.Object3D();
    this.displayedMesh.count = sourceValue.length / 7;
    for (let i = 0; i < sourceValue.length; i += 7) {
      const objectIndex = i / 7;
      dummyMatrix.position.set(
        sourceValue[i + 0],
        sourceValue[i + 1],
        sourceValue[i + 2]
      );
      dummyMatrix.rotation.setFromQuaternion(
        new Quaternion(
          sourceValue[i + 4],
          sourceValue[i + 5],
          sourceValue[i + 6],
          sourceValue[i + 3]
        )
      );
      dummyMatrix.updateMatrix();
      this.displayedMesh.setMatrixAt(objectIndex, dummyMatrix.matrix);
      this.displayedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  updated(changedProperties: any): void {
    const { provider, store, sourceProvider, sourceKey } = this;
    if (!provider || !store || !sourceProvider || !sourceKey) {
      return;
    }

    store.subscribe(
      sourceProvider,
      sourceKey,
      (sourceValue, parentKey, key) => {
        this.updateFromSource(sourceValue, parentKey, key);
      },
      true
    );
  }

  // eslint-disable-next-line class-methods-use-this, camelcase
  private getQuaternionFromRotSeq(
    rotations: Config3d_Rotation[]
  ): THREE.Quaternion {
    const quaternion = new THREE.Quaternion();
    rotations.forEach((rotation) => {
      const axis = new THREE.Vector3(0, 0, 0);
      if (rotation.axis === 'x') axis.setX(1);
      if (rotation.axis === 'y') axis.setY(1);
      if (rotation.axis === 'z') axis.setZ(1);
      quaternion.premultiply(
        new THREE.Quaternion().setFromAxisAngle(
          axis,
          convert(rotation.degrees, 'degrees', 'radians')
        )
      );
    });
    return quaternion;
  }
}
