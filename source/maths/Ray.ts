import { Vector3, Sphere } from "./index";

const _vector = /*@__PURE__*/ new Vector3();
const _segCenter = /*@__PURE__*/ new Vector3();
const _segDir = /*@__PURE__*/ new Vector3();
const _diff = /*@__PURE__*/ new Vector3();

const _edge1 = /*@__PURE__*/ new Vector3();
const _edge2 = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();

export class Ray {
  origin: Vector3;
  direction: Vector3;

  constructor(origin?: Vector3, direction?: Vector3) {
    this.origin = origin || new Vector3();
    this.direction = direction || new Vector3();
  }
  set(origin: Vector3, direction: Vector3) {
    this.origin.copy(origin);
    this.direction.copy(direction);
    return this;
  }

  copy(ray: Ray) {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);
    return this;
  }

  at(t: number, target?: Vector3) {
    target = target || new Vector3();
    return target.copy(this.origin).addScaledVector(this.direction, t);
  }

  lookAt(v: Vector3) {
    this.direction.copy(v).subtract(this.origin).normalize();
    return this;
  }

  /**
   * 重新定向当前对象的位置
   * 此方法用于根据给定的时间参数t，更新对象的位置到某个预定的路径或轨迹上
   * 它通过计算时间t对应的三维向量，将对象的位置重置到该向量所表示的空间位置
   *
   * @param t 用于计算当前对象应位于的路径位置
   * @returns 返回当前对象实例，支持链式调用
   */
  recast(t: number) {
    // 复制当前位置到目标位置，以实现位置的重置
    this.origin.copy(this.at(t, _vector));
    return this;
  }

  /**
   * 计算3D空间中指定点在射线（或直线上）的最近点。
   *
   * 该方法通过给定点的位置和当前射线（由起点origin和方向direction定义），计算出该点到射线的最近投影点。
   * 常用于3D环境中的碰撞检测、距离判断等几何计算。
   *
   * @param point 给定的3D空间中的点，用于计算到射线的最近点。
   * @param target 可选参数，用于存储结果的目标Vector3对象。若未提供则自动创建一个新的Vector3实例。
   * @return 返回一个表示最近点的Vector3对象。
   */
  closestPointToPoint(point: Vector3, target?: Vector3) {
    target = target || new Vector3();
    // 计算从给定点指向射线起点的向量
    target.subtractVectors(point, this.origin);

    const directionDistance = target.dot(this.direction); // 计算投影长度

    if (directionDistance < 0) {
      // 如果投影长度小于0，则最近点为射线的起点
      return target.copy(this.origin);
    }

    // 否则最近点位于射线上，根据投影长度计算最终位置
    return target
      .copy(this.origin)
      .addScaledVector(this.direction, directionDistance);
  }

  distanceToPoint(point: Vector3) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }

  distanceSqToPoint(point: Vector3) {
    const directionDistance = _vector
      .subtractVectors(point, this.origin)
      .dot(this.direction);

    // point behind the ray

    if (directionDistance < 0) {
      return this.origin.distanceToSquared(point);
    }

    _vector
      .copy(this.origin)
      .addScaledVector(this.direction, directionDistance);

    return _vector.distanceToSquared(point);
  }

  distanceSqToSegment(
    v0: Vector3,
    v1: Vector3,
    optionalPointOnRay?: Vector3,
    optionalPointOnSegment?: Vector3
  ) {
    // from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
    // It returns the min distance between the ray and the segment
    // defined by v0 and v1
    // It can also set two optional targets :
    // - The closest point on the ray
    // - The closest point on the segment

    _segCenter.copy(v0).add(v1).multiplyScalar(0.5);
    _segDir.copy(v1).subtract(v0).normalize();
    _diff.copy(this.origin).subtract(_segCenter);

    const segExtent = v0.distanceTo(v1) * 0.5;
    const a01 = -this.direction.dot(_segDir);
    const b0 = _diff.dot(this.direction);
    const b1 = -_diff.dot(_segDir);
    const c = _diff.lengthSq();
    const det = Math.abs(1 - a01 * a01);
    let s0: number, s1: number, sqrDist: number, extDet: number;

    if (det > 0) {
      // The ray and segment are not parallel.

      s0 = a01 * b1 - b0;
      s1 = a01 * b0 - b1;
      extDet = segExtent * det;

      if (s0 >= 0) {
        if (s1 >= -extDet) {
          if (s1 <= extDet) {
            // region 0
            // Minimum at interior points of ray and segment.

            const invDet = 1 / det;
            s0 *= invDet;
            s1 *= invDet;
            sqrDist =
              s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
          } else {
            // region 1

            s1 = segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          // region 5

          s1 = -segExtent;
          s0 = Math.max(0, -(a01 * s1 + b0));
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        }
      } else {
        if (s1 <= -extDet) {
          // region 4

          s0 = Math.max(0, -(-a01 * segExtent + b0));
          s1 =
            s0 > 0
              ? -segExtent
              : Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        } else if (s1 <= extDet) {
          // region 3

          s0 = 0;
          s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = s1 * (s1 + 2 * b1) + c;
        } else {
          // region 2

          s0 = Math.max(0, -(a01 * segExtent + b0));
          s1 =
            s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        }
      }
    } else {
      // Ray and segment are parallel.

      s1 = a01 > 0 ? -segExtent : segExtent;
      s0 = Math.max(0, -(a01 * s1 + b0));
      sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
    }

    if (optionalPointOnRay) {
      optionalPointOnRay.copy(this.origin).addScaledVector(this.direction, s0);
    }

    if (optionalPointOnSegment) {
      optionalPointOnSegment.copy(_segCenter).addScaledVector(_segDir, s1);
    }

    return sqrDist;
  }

  intersectSphere( sphere: Sphere, target?: Vector3 ) {
       target = target || new Vector3();

		_vector.subtractVectors( sphere.center, this.origin );
		const tca = _vector.dot( this.direction );
		const d2 = _vector.dot( _vector ) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;

		if ( d2 > radius2 ) return null;

		const thc = Math.sqrt( radius2 - d2 );

		// t0 = first intersect point - entrance on front of sphere
		const t0 = tca - thc;

		// t1 = second intersect point - exit point on back of sphere
		const t1 = tca + thc;

		// test to see if t1 is behind the ray - if so, return null
		if ( t1 < 0 ) return null;

		// test to see if t0 is behind the ray:
		// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
		// in order to always return an intersect point that is in front of the ray.
		if ( t0 < 0 ) return this.at( t1, target );

		// else t0 is in front of the ray, so return the first collision point scaled by t0
		return this.at( t0, target );

	}
}
