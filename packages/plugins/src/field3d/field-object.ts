// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';
// eslint-disable-next-line import/no-extraneous-dependencies

import Pose3d from './pose-3d';

export default class Field3DObject {
  objects: Array<THREE.Object3D>;
  name: string;
  geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
  material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  scene: THREE.Scene;
  constructor(poses: Array<Pose3d>, name: string, scene: THREE.Scene) {
    this.name = name;
    this.objects = [];
    this.scene = scene;
    this.setPoses(poses);
  }
  setPose(pose: Pose3d): void {
    this.setPoses([pose]);
  }

  setPoses(poses: Array<Pose3d>): void {
    this.objects.forEach((element) => {
      this.scene.remove(element);
    });
    this.objects = poses.map((pose, index) => {
      const newObject = new THREE.Mesh(this.geometry, this.material);
      newObject.setRotationFromQuaternion(
        new THREE.Quaternion(pose.qx, pose.qy, pose.qz, pose.qw)
      );
      newObject.position.set(pose.x, pose.y, pose.z);
      return newObject;
    });
    this.objects.forEach((element) => {
      this.scene.add(element);
    });
  }
}
