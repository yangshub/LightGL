import { Object3D } from '@source/core/Object3D';
import { Matrix4, Vector3 } from '@source/maths';

export class Camera extends Object3D {
  matrixWorldInverse: Matrix4;
  projectionMatrix: Matrix4;
  projectionMatrixInverse: Matrix4;
  constructor() {
    super();
    this.matrixWorldInverse = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.projectionMatrixInverse = new Matrix4();
  }

  copy(source: Camera, recursive: boolean) {
    super.copy(source, recursive);
    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);
    this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

    return this;
  }

  getWorldDirection(target: Vector3) {
    return super.getWorldDirection(target).negate();
  }

  updateMatrixWorld(force: boolean) {
    super.updateMatrixWorld(force);
    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean) {
    super.updateWorldMatrix(updateParents, updateChildren);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  clone() {
    return new Camera().copy(this, true);
  }
}

export interface View {
  enabled: boolean;
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}
