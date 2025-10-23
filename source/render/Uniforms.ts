export type UniformCallback = () => number | number[];
export type UniformValue = number | number[] | UniformCallback;
export type Uniforms = Record<string, UniformValue>;
