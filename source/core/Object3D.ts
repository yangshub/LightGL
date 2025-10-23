import EventEmitter from "eventemitter3";
import { generateUUID } from "../utils/MathUtils";
import { Vector3 } from "../maths/Vector3";
import { Euler } from "../maths/Euler";
import { Quaternion } from "../maths/Quaternion";
import { watchObj } from "../utils/watchObj";
import { Matrix4 } from "../maths/Matrix4";
import { Matrix3 } from "../maths/Matrix3";

let _object3DId = 0;
const _q1 = new Quaternion();
const _xAxis = new Vector3(1, 0, 0);
const _yAxis = new Vector3(0, 1, 0);
const _zAxis = new Vector3(0, 0, 1);
const _v1 = new Vector3();
const _m1 = new Matrix4();
const _target = new Vector3();

enum Object3DType {
  Object3D = "Object3D",
}

export class Object3D extends EventEmitter {
  id: number;
  uuid: string;
  name: string;
  type: Object3DType = Object3DType.Object3D;
  parent: Object3D | null = null;
  children: Object3D[] = [];
  up: Vector3;
  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  scale: Vector3;
  modelViewMatrix: Matrix4;
  normalMatrix: Matrix3;
  matrix: Matrix4;
  matrixWorld: Matrix4;
  matrixAutoUpdate: boolean;
  matrixWorldAutoUpdate: boolean;
  matrixWorldNeedsUpdate: boolean;
  visible: boolean;
  constructor(options: { name?: string }) {
    super();
    this.id = _object3DId++;
    this.uuid = generateUUID();
    this.name = options?.name || "";
    this.up = Object3D.DEFAULT_UP.clone();
    this.position = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.rotation = watchObj(new Euler(), (euler) => {
      this.quaternion.setFromEuler(euler);
    });
    this.quaternion = watchObj(new Quaternion(), (quaternion) => {
      this.rotation.setFromQuaternion(quaternion);
    });
    this.modelViewMatrix = new Matrix4();
    this.normalMatrix = new Matrix3();
    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();
    this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
    this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
    this.matrixWorldNeedsUpdate = false;
    this.visible = true;
  }

  applyMatrix4(matrix: Matrix4) {
    if (this.matrixAutoUpdate) this.updateMatrix();
    this.matrix.preMultiply(matrix);
    this.matrix.decompose(this.position, this.quaternion, this.scale);
    return this;
  }

  applyQuaternion(quaternion: Quaternion) {
    this.quaternion.premultiply(quaternion);
    return this;
  }

  setRotationFromAxisAngle(axis: Vector3, angle: number) {
    this.quaternion.setFromAxisAngle(axis, angle);
    return this;
  }
  setRotationFromEuler(euler: Euler) {
    this.quaternion.setFromEuler(euler);
    return this;
  }

  setRotationFromMatrix(m: Matrix4) {
    this.quaternion.setFromRotationMatrix(m);
    return this;
  }

  setRotationFromQuaternion(q: Quaternion) {
    this.quaternion.copy(q);
    return this;
  }

  rotateOnAxis(axis: Vector3, angle: number) {
    _q1.setFromAxisAngle(axis, angle);
    this.quaternion.multiply(_q1);
    return this;
  }

  rotateOnWorldAxis(axis: Vector3, angle: number) {
    _q1.setFromAxisAngle(axis, angle);
    this.quaternion.premultiply(_q1);
    return this;
  }
  rotateX(angle: number) {
    return this.rotateOnAxis(_xAxis, angle);
  }
  rotateY(angle: number) {
    return this.rotateOnAxis(_yAxis, angle);
  }
  rotateZ(angle: number) {
    return this.rotateOnAxis(_zAxis, angle);
  }

  translateOnAxis(axis: Vector3, distance: number) {
    _v1.copy(axis).applyQuaternion(this.quaternion);
    this.position.add(_v1.multiplyScalar(distance));
    return this;
  }

  translateX(distance: number) {
    return this.translateOnAxis(_xAxis, distance);
  }

  translateY(distance: number) {
    return this.translateOnAxis(_yAxis, distance);
  }

  translateZ(distance: number) {
    return this.translateOnAxis(_zAxis, distance);
  }

  localToWorld(vector: Vector3) {
    return vector.applyMatrix4(this.matrixWorld);
  }

  worldToLocal(vector: Vector3) {
    return vector.applyMatrix4(_m1.copy(this.matrixWorld).invert());
  }

  lookAt(target: Vector3) {
    _target.copy(target);
    const parent = this.parent;

    this.updateWorldMatrix(true, false);
  }

  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.matrixWorldNeedsUpdate = true;
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean) {
    const parent = this.parent;

    if (updateParents === true && parent !== null) {
      parent.updateWorldMatrix(true, false);
    }
    if (this.matrixAutoUpdate) this.updateMatrix();
    if (this.matrixWorldAutoUpdate === true) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }
    }

    // make sure descendants are updated

    if (updateChildren === true) {
      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];

        child.updateWorldMatrix(false, true);
      }
    }
  }

  static DEFAULT_UP = new Vector3(0, 1, 0);
  static DEFAULT_MATRIX_AUTO_UPDATE = true;
}
