/* eslint-disable class-methods-use-this */
/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import * as THREE from 'three';

import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  Config3dField,
  Config3dRobot,
  Config3dRobot_Camera,
  Config3d_Rotation,
} from './FRCData';
import { convert } from './units';

export interface Pose3d {
  position: [number, number, number]; // X, Y, Z
  rotation: [number, number, number, number]; // W, X, Y, Z
}

export type Command = {
  objects: THREE.Object3D[];
  options: {
    field: string;
    robot: string;
    alliance: string;
  };
};
export default class ThreeDimensionVisualizer {
  // private EFFICIENCY_MAX_FPS = 15;
  private ORBIT_FOV = 50;
  private ORBIT_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_FIELD_DEFAULT_POSITION = new THREE.Vector3(0, 6, -12);
  private ORBIT_ROBOT_DEFAULT_POSITION = new THREE.Vector3(2, 1, 1);
  private WPILIB_ROTATION = this.getQuaternionFromRotSeq([
    {
      axis: 'x',
      degrees: -90,
    },
    {
      axis: 'y',
      degrees: 180,
    },
  ]);

  private canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: ArcballControls;
  private wpilibCoordinateGroup: THREE.Group; // Rotated to match WPILib coordinates
  private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates (origin at driver stations and flipped based on alliance)
  private field: THREE.Object3D | null = null;
  private robot: THREE.Object3D | null = null;
  private robotCameras: THREE.Object3D[] = [];

  private command: Command;
  private cameraIndex = -1;
  private lastCameraIndex = -1;
  // private lastFrameTime = 0;
  private lastWidth: number | null = 0;
  private lastHeight: number | null = 0;
  private lastDevicePixelRatio: number | null = null;
  private lastIsDark: boolean | null = null;
  private lastAspectRatio: number | null = null;
  // private lastPrefsMode = "";
  // private lastIsBattery = false;
  // private lastFrcDataString = "";
  private lastFieldTitle = '';
  private lastRobotTitle = '';
  private lastRobotVisible = false;
  private lastAlliance = 'blue';

  private field3dConfig: Config3dField;
  private robot3dConfig: Config3dRobot;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    // eslint-disable-next-line prefer-destructuring

    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.scene = new THREE.Scene();

    this.field3dConfig = {
      title: 'Field',
      path: '/models/Field3d_Evergreen.glb',
      rotations: [],
      // rotations: [{ axis: 'x', degrees: 90 }],
      widthInches: 12 * 54,
      heightInches: 12 * 27,
    };

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
    // Create coordinate groups
    this.wpilibCoordinateGroup = new THREE.Group();
    this.scene.add(this.wpilibCoordinateGroup);
    this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
    this.wpilibFieldCoordinateGroup = new THREE.Group();
    this.wpilibCoordinateGroup.add(this.wpilibFieldCoordinateGroup);

    // Create camera
    {
      const fov = this.ORBIT_FOV;
      const aspect = 2;
      const near = 0.1;
      const far = 100;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.copy(this.ORBIT_FIELD_DEFAULT_POSITION);
      this.camera.lookAt(
        this.ORBIT_DEFAULT_TARGET.x,
        this.ORBIT_DEFAULT_TARGET.y,
        this.ORBIT_DEFAULT_TARGET.z
      );
    }

    // Create controls
    this.controls = new ArcballControls(this.camera, canvas, this.scene);
    this.controls.target.copy(this.ORBIT_DEFAULT_TARGET);
    this.controls.maxDistance = 30;
    this.controls.enabled = true;
    this.controls.update();

    // Add lights
    {
      const skyColor = 0xffffff;
      const groundColor = 0x000000;
      const intensity = 0.5;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      this.scene.add(light);
    }
    {
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(-12, 10, -12);
      this.scene.add(light);
    }
    {
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(0, -10, 0);
      this.scene.add(light);
    }
    this.command = {
      objects: [],
      options: {
        field: this.field3dConfig.title,
        robot: this.robot3dConfig.title,
        alliance: 'blue',
      },
    };

    const isBlue = this.command.options?.alliance == 'blue';
    this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      isBlue ? 0 : Math.PI
    );
    this.wpilibFieldCoordinateGroup.position.set(
      convert(this.field3dConfig.widthInches / 2, 'inches', 'meters') *
        (isBlue ? -1 : 1),
      convert(this.field3dConfig.heightInches / 2, 'inches', 'meters') *
        (isBlue ? -1 : 1),
      0
    );
    // Load cone texture
    // Render when camera is moved
    // eslint-disable-next-line no-return-assign
    this.controls.addEventListener('change', () => this.renderFrame());
    // Render loop
    const periodic = () => {
      this.renderFrame();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  /** Switches the selected camera. */
  set3DCamera(index: number) {
    this.cameraIndex = index;
    this.renderFrame();
  }

  render(command: Partial<Command>): number | null {
    Object.assign(this.command, command);
    if (JSON.stringify(command) !== JSON.stringify(this.command)) {
      this.renderFrame();
    }

    return this.lastAspectRatio;
  }

  private renderFrame() {
    // Check for new render mode

    // Check for new size, device pixel ratio, or theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (
      this.renderer.domElement.clientWidth != this.lastWidth ||
      this.renderer.domElement.clientHeight != this.lastHeight ||
      window.devicePixelRatio != this.lastDevicePixelRatio ||
      isDark != this.lastIsDark
    ) {
      this.lastWidth = this.renderer.domElement.clientWidth;
      this.lastHeight = this.renderer.domElement.clientHeight;
      this.lastDevicePixelRatio = window.devicePixelRatio;
      this.lastIsDark = isDark;
    }

    // Exit if no command is set
    if (!this.command) {
      console.log(' no command ');
      return; // Continue trying to render
    }

    // Limit FPS in efficiency mode
    // const isEfficiency =
    //   window.preferences?.threeDimensionMode == "efficiency" ||
    //   (window.preferences?.threeDimensionMode == "auto" && window.isBattery);
    // const now = new Date().getTime();
    // if (isEfficiency && now - this.lastFrameTime < 1000 / this.EFFICIENCY_MAX_FPS) {
    //   return; // Continue trying to render
    // }

    // Check if rendering should continue
    // this.lastFrameTime = now;

    // Get config
    const fieldObjects = this.command.objects as THREE.Object3D[];
    const fieldTitle = this.command.options?.field || this.lastFieldTitle;
    const robotTitle = this.command.options?.robot || this.lastRobotTitle;
    const fieldConfig = this.field3dConfig;
    const robotConfig = this.robot3dConfig;
    if (fieldConfig == undefined || robotConfig == undefined) return;

    // Check for new FRC data

    // Add field
    if (fieldTitle != this.lastFieldTitle) {
      this.lastFieldTitle = fieldTitle;
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
      }
      const loader = new GLTFLoader();
      loader.load(fieldConfig.path, (gltf) => {
        if (fieldConfig == undefined) return;

        // Add to scene
        this.field = gltf.scene;
        this.field.rotation.setFromQuaternion(
          this.getQuaternionFromRotSeq(fieldConfig.rotations)
        );
        this.wpilibCoordinateGroup.add(this.field);

        // Render new frame
        this.renderFrame();
      });
    }

    // Add robot

    if (fieldObjects) {
      fieldObjects.forEach((value) => {
        if (!this.wpilibFieldCoordinateGroup.children.includes(value)) {
          this.wpilibFieldCoordinateGroup.add(value);
        }
      });
    }

    // Render new frame
    const { devicePixelRatio } = window;
    // const canvas = this.renderer.domElement;
    // const clientWidth = canvas.width;
    // const clientHeight = canvas.height;
    // if (canvas.width / devicePixelRatio != clientWidth || canvas.height / devicePixelRatio != clientHeight) {
    //   this.renderer.setSize(clientWidth, clientHeight, false);
    //   this.camera.aspect = clientWidth / clientHeight;
    //   this.camera.updateProjectionMatrix();
    // }
    this.scene.background = isDark
      ? new THREE.Color('#222222')
      : new THREE.Color('#ffffff');
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }

  public resizeCanvas(clientWidth: number, clientHeight: number) {
    const { devicePixelRatio } = window;
    const canvas = this.renderer.domElement;
    if (
      canvas.width / devicePixelRatio != clientWidth ||
      canvas.height / devicePixelRatio != clientHeight
    ) {
      this.renderer.setSize(
        clientWidth / devicePixelRatio,
        clientHeight / devicePixelRatio,
        false
      );
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderFrame();
    }
  }
  /** Converts a rotation sequence to a quaternion. */
  private getQuaternionFromRotSeq(
    rotations: Config3d_Rotation[]
  ): THREE.Quaternion {
    const quaternion = new THREE.Quaternion();
    rotations.forEach((rotation) => {
      const axis = new THREE.Vector3(0, 0, 0);
      if (rotation.axis == 'x') axis.setX(1);
      if (rotation.axis == 'y') axis.setY(1);
      if (rotation.axis == 'z') axis.setZ(1);
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
