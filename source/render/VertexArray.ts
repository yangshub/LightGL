/** 用来管理顶点数组对象 */

import { Program } from "./Program";

export type BufferType =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export enum BufferTargetType {
  ARRAY_BUFFER = 34962,
  ELEMENT_ARRAY_BUFFER = 34963,
}

export enum DataType {
  BYTE = 0x1400,
  UNSIGNED_BYTE = 0x1401,
  SHORT = 0x1402,
  UNSIGNED_SHORT = 0x1403,
  INT = 0x1404,
  UNSIGNED_INT = 0x1405,
  FLOAT = 0x1406,
}

// 定义渲染操作的使用类型枚举
export enum UsageType {
  // 静态绘制：用于渲染静态数据，数据在绘制过程中不会改变
  STATIC_DRAW = 35044,
  // 动态绘制：用于渲染动态数据，数据在绘制过程中可能会改变
  DYNAMIC_DRAW = 35048,
}

type IVertexAttribute = {
  /** 属性名 */
  name: string;
  /** 属性数据 */
  data?: BufferType;
  /** 属性数据的长度 */
  size: number;
  /** 缓冲区对象 */
  buffer?: WebGLBuffer;
  /** 缓冲区数据的使用方式 */
  usage?: UsageType;
  /** 顶点属性的类型 */
  type?: DataType;
  /** 实例化的间隔 */
  divisor?: number;
  /** 是否归一化 */
  normalized?: boolean;
  /** 顶点属性的字节长度 */
  stride?: number;
  /** 顶点属性的起始位置 */
  offset?: number;
};

export class VertexArray {
  gl: WebGL2RenderingContext;
  indexArray?: Int32Array;
  attributes: IVertexAttribute[];
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.attributes = [];
  }

  adddAttribute(attribute: IVertexAttribute) {
    this.attributes.push(attribute);
  }

  removeAttribute(name: string) {
    this.attributes = this.attributes.filter((attr) => attr.name !== name);
  }

  getAttribute(name: string) {
    return this.attributes.find((attr) => attr.name === name);
  }

  bind(program: Program) {
    this.attributes.forEach((attr) => {
      this.bindAttribute(attr, program);
    });
  }

  bindAttribute(attribute: IVertexAttribute, program: Program) {
    let location = program.getAttributeLocation(attribute.name);
    console.log(attribute.name, location);
    let gl = this.gl;
    if (location === -1) return;
    let { buffer, size, type, normalized, stride, offset, data, usage } =
      attribute;
    usage = usage || UsageType.STATIC_DRAW;
    type = type || DataType.FLOAT;
    normalized = normalized || false;
    stride = stride || 0;
    offset = offset || 0;

    if (!data) return;
    if (!buffer) {
      buffer = this.createBuffer(data, gl.ARRAY_BUFFER, usage);
      attribute.buffer = buffer;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
  }

  createBuffer(data: BufferType, target: number, usage: number) {
    let buffer = this.gl.createBuffer();
    if (!buffer) throw new Error("Failed to create buffer");
    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, usage);
    return buffer;
  }

  updateAttributeData(name: string, data: BufferType) {
    let attr = this.getAttribute(name);
    if (!attr) throw new Error(`Attribute not found: ${name}`);
    let buffer = attr.buffer;
    if (!buffer) throw new Error(`Buffer not found for attribute: ${name}`);
    let { gl } = this;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, attr.usage || UsageType.STATIC_DRAW);
  }
}
