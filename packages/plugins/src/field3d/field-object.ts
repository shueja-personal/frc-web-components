/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { WebbitConfig } from '@webbitjs/webbit';
import Store, { SourceProvider } from '@webbitjs/store';
import * as THREE from 'three';
import { Quaternion } from 'three';

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
  private displayedMesh: THREE.InstancedMesh;
  private coneTexture: THREE.Texture;
  private coneTextureBase: THREE.Texture;
  private MAX_INSTACE_COUNT = 500;

  constructor() {
    super();
    // Setup for cone mesh option
    {
      const loader = new THREE.TextureLoader();
      this.coneTexture = loader.load('/textures/cone-green.png');
      this.coneTexture.offset.set(0.25, 0);
      this.coneTextureBase = loader.load('/textures/cone-green-base.png');
    }

    this.coneMesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.18, 0.75, 16, 32),
      [
        new THREE.MeshPhongMaterial({
          map: this.coneTexture,
        }),
        new THREE.MeshPhongMaterial(),
        new THREE.MeshPhongMaterial({
          map: this.coneTextureBase,
        }),
      ],
      this.MAX_INSTACE_COUNT
    );

    this.displayedMesh = this.coneMesh;
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
}
