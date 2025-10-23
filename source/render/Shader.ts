import {type UniformValue } from "./Uniforms";

export enum ShaderType {
  VERTEX_SHADER = 0x8b31,
  FRAGMENT_SHADER = 0x8b30,
}

export class Shader {
  gl: WebGL2RenderingContext;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  inValues: Map<string, string>;
  uniforms: Map<string, string>;

  constructor(
    gl: WebGL2RenderingContext,
    vertexShader: string,
    fragmentShader: string
  ) {
    this.gl = gl;
    this.vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    this.inValues = this.parseInValues(vertexShader);
    this.uniforms = this.parseUniforms(vertexShader, fragmentShader);
  }

  /** 解析attributes入参变量 */
  parseInValues(vertexShader: string) {
    let lines = vertexShader.split("\n");
    const results = new Map<string, string>();

    // 匹配 in 变量声明的正则表达式（支持类型、变量名、数组和多余空格）
    const inVarRegex = /\bin\s+(\w+)\s+(\w+)\s*(\[\d*\])?\s*;/;

    lines.forEach((line, index) => {
      // 移除行尾注释和多余空格
      const cleanLine = line.split("//")[0].trim();
      if (!cleanLine) return;

      const match = cleanLine.match(inVarRegex);
      if (match) {
        // 提取类型、名称和数组维度（如有）
        const type = match[1];
        let name = match[2];

        results.set(name, type);
      }
    });
    return results;
  }

  /** 解析uniforms入参变量 */
  parseUniforms(
    vertexShader: string,
    fragmentShader: string
  ): Map<string, string> {
    let lines = vertexShader.split("\n");
    lines = lines.concat(fragmentShader.split("\n"));

    const uniforms = new Map<string, string>();

    // 匹配uniform声明：支持基础类型、向量、矩阵、数组及结构体
    const uniformRegex =
      /uniform\s+(\w+(?:\s*\d?[x\d]?)?\s*\w*)\s+(\w+(?:\s*\[\s*\d*\s*\])?)(?:\s*,\s*\w+(?:\s*\[\s*\d*\s*\])?)*\s*;|uniform\s+struct\s*\{([^}]+)\}\s*(\w+);?/g;

    for (const line of lines) {
      // 跳过注释行
      if (line.trim().startsWith("//") || line.trim().startsWith("/*"))
        continue;

      let match: any;
      while ((match = uniformRegex.exec(line)) !== null) {
        if (match[1] && match[2]) {
          // 处理基础类型和数组
          const type = match[1].trim();
          const names = match[2].split(",").map((name) => name.trim());

          for (const fullName of names) {
            // 分离变量名和数组维度（如"light[10]"）
            const arrayMatch = fullName.match(/(\w+)\s*(\[\s*\d*\s*\])?/);
            if (arrayMatch) {
              uniforms.set(arrayMatch[1], type + (arrayMatch[2] ? "[]" : ""));
            }
          }
        } else if (match[3] && match[4]) {
          // 处理结构体（如uniform struct { vec3 color; } material;）
          const structFields = match[3]
            .split(";")
            .filter((field: any) => field.trim())
            .map((field: any) => {
              const [fieldType, fieldName] = field.trim().split(/\s+/);
              uniforms.set(`${match[4]}.${fieldName}`, fieldType);
            });
        }
      }
    }

    return uniforms;
  }

  applyUniformValue(
    name: string,
    value: UniformValue,
    location: WebGLUniformLocation
  ) {
    if (typeof value === "function") {
      value = value();
    }
    let type = this.uniforms.get(name);
    let gl = this.gl;
    if (!type) throw new Error(`Failed to get uniform type: ${name}`);
    validate(type, value);
    switch (type) {
      case "float":
        gl.uniform1f(location, value as number);
        break;
      case "vec2":
        gl.uniform2fv(location, value as number[]);
        break;
      case "vec3":
        gl.uniform3fv(location, value as number[]);
        break;
      case "vec4":
        gl.uniform4fv(location, value as number[]);
        break;
      case "mat2":
        gl.uniformMatrix2fv(location, false, value as number[]);
        break;
      case "mat3":
        gl.uniformMatrix3fv(location, false, value as number[]);
        break;
      case "mat4":
        gl.uniformMatrix4fv(location, false, value as number[]);
        break;
      case "int":
        gl.uniform1i(location, value as number);
        break;
      case "ivec2":
        gl.uniform2iv(location, value as number[]);
        break;
      case "ivec3":
        gl.uniform3iv(location, value as number[]);
        break;
      case "ivec4":
        gl.uniform4iv(location, value as number[]);
        break;
      case "uint":
        gl.uniform1ui(location, value as number);
        break;
      case "uvec2":
        gl.uniform2uiv(location, value as number[]);
        break;
      case "uvec3":
        gl.uniform3uiv(location, value as number[]);
        break;
      case "uvec4":
        gl.uniform4uiv(location, value as number[]);
        break;
      case "Sampler2D":
        gl.uniform1i(location, value as number);
        break;
    }
  }
}

function validate(type: string, value: number | number[]) {
  if (
    type === "float" ||
    type === "int" ||
    type === "uint" ||
    type === "Sampler2D"
  ) {
    if (typeof value !== "number") throw new Error("Invalid value type");
  } else if (type === "vec2" || type === "ivec2" || type === "uvec2") {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error("Invalid value type");
    }
  } else if (type === "vec3" || type === "ivec3" || type === "uvec3") {
    if (!Array.isArray(value) || value.length !== 3) {
      throw new Error("Invalid value type");
    }
  } else if (type === "vec4" || type === "ivec4" || type === "uvec4") {
    if (!Array.isArray(value) || value.length !== 4) {
      throw new Error("Invalid value type");
    }
  } else if (type === "mat2" || type === "mat3" || type === "mat4") {
    if (!Array.isArray(value)) throw new Error("Invalid value type");
  } else {
    throw new Error("Invalid uniform type");
  }
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  let shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let log = gl.getShaderInfoLog(shader);
    if (log) throw new Error(log);
  }
  return shader;
}
