import { Shader } from "./Shader";
import { type Uniforms } from "./Uniforms";

export class Program {
  gl: WebGL2RenderingContext;
  shader: Shader;
  program: WebGLProgram;
  uniformAddress: Map<string, WebGLUniformLocation>;
  attributeAddress: Map<string, number>;

  constructor(gl: WebGL2RenderingContext, shader: Shader) {
    this.gl = gl;
    this.shader = shader;
    this.program = this.createProgram();
    this.useProgram();
    this.uniformAddress = new Map();
    this.attributeAddress = this.initAttributeAddress();
  }

  createProgram(): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error("Failed to create program");
    const { vertexShader, fragmentShader } = this.shader;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    return program;
  }

  useProgram() {
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);
    this.uniformAddress = this.initUniformAddress();
  }

  initUniformAddress() {
    let uniforms = this.shader.uniforms;
    let uniformLocations = new Map<string, WebGLUniformLocation>();
    for (let [key, type] of uniforms) {
      let address = this.gl.getUniformLocation(this.program, key);
      if (!address) throw new Error(`Failed to get uniform address: ${key}`);
      uniformLocations.set(key, address);
    }
    return uniformLocations;
  }

  initAttributeAddress() {
    let attributes = this.shader.inValues;
    let attributeLocations = new Map<string, number>();
    for (let [key, value] of attributes) {
      let address = this.gl.getAttribLocation(this.program, key);
      if (address < 0)
        throw new Error(`Failed to get attribute address: ${key}`);
      attributeLocations.set(key, address);
    }
    return attributeLocations;
  }

  getUniformLocation(name: string): WebGLUniformLocation {
    let location = this.uniformAddress.get(name);
    if (!location) throw new Error(`Failed to get uniform location: ${name}`);
    return location;
  }

  getAttributeLocation(name: string): number {
    let location = this.attributeAddress.get(name);
    if (location === undefined || location < 0) throw new Error(`Failed to get attribute location: ${name}`);
    return location;
  }

  setUniforms(uniforms: Uniforms) {
    for (let [name, value] of Object.entries(uniforms)) {
      let location = this.getUniformLocation(name);
      this.shader.applyUniformValue(name, value, location);
    }
  }
}
