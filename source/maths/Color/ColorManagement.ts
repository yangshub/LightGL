import {
  SRGBColorSpace,
  LinearSRGBColorSpace,
  SRGBTransfer,
  LinearTransfer,
} from './Constants';
import { Matrix3 } from '../Matrix3';
import type { Color } from './Color';
import type { Vector3 } from '../Vector3';

const LINEAR_REC709_TO_XYZ = /*@__PURE__*/ new Matrix3().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
);

const XYZ_TO_LINEAR_REC709 = /*@__PURE__*/ new Matrix3().set(
  3.2409699,
  -1.5373832,
  -0.4986108,
  -0.9692436,
  1.8759675,
  0.0415551,
  0.0556301,
  -0.203977,
  1.0569715
);

export enum ColorSpaceType {
  SRGB = 'srgb',
  LinearSRGB = 'srgb-linear',
  NoColorSpace = '',
}

interface ColorSpace {
  primaries: [number, number, number, number, number, number];
  whitePoint: [number, number];
  toXYZ: Matrix3;
  fromXYZ: Matrix3;
  luminanceCoefficients: [number, number, number];
  transfer: string;
  outputColorSpaceConfig?: {
    drawingBufferColorSpace: ColorSpaceType;
  };
  workingColorSpaceConfig?: {
    unpackColorSpace: ColorSpaceType;
  };
}

class ColorManagement {
  enabled: boolean = true;
  workingColorSpace: ColorSpaceType = ColorSpaceType.LinearSRGB;
  spaces: Record<string, ColorSpace> = {};

  convert(color: Color, sourceColorSpace: ColorSpaceType, targetColorSpace: ColorSpaceType): Color {
    if (
      this.enabled === false ||
      sourceColorSpace === targetColorSpace ||
      !sourceColorSpace ||
      !targetColorSpace
    ) {
      return color;
    }

    if (this.spaces[sourceColorSpace].transfer === SRGBTransfer) {
      color.r = SRGBToLinear(color.r);
      color.g = SRGBToLinear(color.g);
      color.b = SRGBToLinear(color.b);
    }
    if (this.spaces[sourceColorSpace].primaries !== this.spaces[targetColorSpace].primaries) {
      color.applyMatrix3(this.spaces[sourceColorSpace].toXYZ);
      color.applyMatrix3(this.spaces[targetColorSpace].fromXYZ);
    }

    if (this.spaces[targetColorSpace].transfer === SRGBTransfer) {
      color.r = LinearToSRGB(color.r);
      color.g = LinearToSRGB(color.g);
      color.b = LinearToSRGB(color.b);
    }

    return color;
  }

  fromWorkingColorSpace(color: Color, targetColorSpace: ColorSpaceType) {
    return this.convert(color, this.workingColorSpace, targetColorSpace);
  }

  toWorkingColorSpace(color: Color, sourceColorSpace: ColorSpaceType) {
    return this.convert(color, sourceColorSpace, this.workingColorSpace);
  }

  getPrimaries(colorSpace: ColorSpaceType) {
    return this.spaces[colorSpace].primaries;
  }

  getLuminanceCoefficients(target: Vector3, colorSpace: ColorSpaceType) {
    return target.fromArray(this.spaces[colorSpace].luminanceCoefficients);
  }

  define(spaces: Record<string, ColorSpace>) {
    Object.assign(this.spaces, spaces);
  }

  _getMatrix(
    targetMatrix: Matrix3,
    sourceColorSpace: ColorSpaceType,
    targetColorSpace: ColorSpaceType
  ) {
    return targetMatrix
      .copy(this.spaces[sourceColorSpace].toXYZ)
      .multiply(this.spaces[targetColorSpace].fromXYZ);
  }

  _getDrawingBufferColorSpace(colorSpace: ColorSpaceType) {
    return this.spaces[colorSpace].outputColorSpaceConfig?.drawingBufferColorSpace;
  }

  _getUnpackColorSpace(colorSpace: ColorSpaceType) {
    return this.spaces[colorSpace].workingColorSpaceConfig?.unpackColorSpace;
  }
}

const colorManagement = new ColorManagement();

const REC709_PRIMARIES: [number, number, number, number, number, number] = [
  0.64, 0.33, 0.3, 0.6, 0.15, 0.06,
];
const REC709_LUMINANCE_COEFFICIENTS: [number, number, number] = [0.2126, 0.7152, 0.0722];
const D65: [number, number] = [0.3127, 0.329];

colorManagement.define({
  [LinearSRGBColorSpace]: {
    primaries: REC709_PRIMARIES,
    whitePoint: D65,
    transfer: LinearTransfer,
    toXYZ: LINEAR_REC709_TO_XYZ,
    fromXYZ: XYZ_TO_LINEAR_REC709,
    luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
    workingColorSpaceConfig: { unpackColorSpace: ColorSpaceType.SRGB },
    outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpaceType.SRGB },
  },

  [SRGBColorSpace]: {
    primaries: REC709_PRIMARIES,
    whitePoint: D65,
    transfer: SRGBTransfer,
    toXYZ: LINEAR_REC709_TO_XYZ,
    fromXYZ: XYZ_TO_LINEAR_REC709,
    luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
    outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpaceType.SRGB },
  },
});

export { colorManagement };

export function SRGBToLinear(c: number) {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

export function LinearToSRGB(c: number) {
  return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}
