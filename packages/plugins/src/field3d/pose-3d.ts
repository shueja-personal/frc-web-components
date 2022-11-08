export default class Pose3d {
  x: number;
  y: number;
  z: number;
  qw: number;
  qx: number;
  qy: number;
  qz: number;
  constructor(
    x: number,
    y: number,
    z: number,
    qw: number,
    qx: number,
    qy: number,
    qz: number
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.qw = qw;
    this.qx = qx;
    this.qy = qy;
    this.qz = qz;
  }
}
