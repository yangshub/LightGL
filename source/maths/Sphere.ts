import { Vector3 } from "./index";

export class Sphere {
  center: Vector3;
  radius: number;

  constructor(center?: Vector3, radius?: number) {
    this.center = center || new Vector3();
    this.radius = radius || 0;
  }
}
