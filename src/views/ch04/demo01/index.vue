<script setup lang="ts">
import { Color, DEG2RAD, Euler, Matrix4, Program, Shader, Vector3, type Uniforms } from "@source/index";
import { CanvasEventProxy, convertPositionToWebGLPosition, EventType } from "@source/render/CanvasEventProxy";
import { VertexArray } from "@source/render/VertexArray";
import { ref, onMounted, onUnmounted, reactive } from "vue";

const canvasContainer = ref<HTMLCanvasElement | null>(null);
let canvasEventProxy: CanvasEventProxy;
const color = new Color(1, 0, 0);
const compState = reactive({
    offset: {
        x: 0,
        y: 0,
        z: 0
    },
    rotate: {
        x: 0,
        y: 0,
        z: 0
    },
    camera: {
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        direction: {
            x: 0,
            y: 0,
            z: -1
        },
        up: {
            x: 0,
            y: 1,
            z: 0
        }
        
    }
});

onMounted(() => {
    let canvas = canvasContainer.value;
    if (canvas) {
        let webgl2RenderingContext = canvas.getContext("webgl2");
        if (webgl2RenderingContext) {
            initLightGL(webgl2RenderingContext);
        }
        // initCanvasEventProxy(canvas);
    }
});

onUnmounted(() => {
    canvasEventProxy?.destroy();
});

const points = getCubePoints(new Vector3(0, 0, 0), new Vector3(0.25, 0.25, 0.25));


function initLightGL(gl: WebGL2RenderingContext) {
    // gl.clearColor(1, 1, 0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    let shaders = initShaders(gl);
    let program = new Program(gl, shaders);
    let uniforms = {
        uColor: () => {
            return color.toArray();
        },
        uModelMatrix: () => {
            let matrix = Matrix4.identity();
            let now = performance.now() / 1000;
            let z = Math.sin(now) * Math.PI + compState.offset.z * DEG2RAD;
            let euler = new Euler(compState.rotate.x * DEG2RAD, compState.rotate.y * DEG2RAD, z);
            matrix.makeRotationFromEuler(euler);
            let x = Math.sin(now) * 0.7 + compState.offset.x;
            matrix.setPosition(x, compState.offset.y, 0);
            return matrix.toArray();
        },
        uWorldMatrix: () => {
            return []
        },
        uProjectionMatrix: () => {
            return []
        }
        

    };
    let vertexArray = new VertexArray(gl);

    vertexArray.adddAttribute({
        name: "a_position",
        size: 3,
        data: new Float32Array(points),
    })

    program.useProgram();
    vertexArray.bind(program);
    program.setUniforms(uniforms);


    render(gl, program, uniforms, vertexArray);

}

function initCanvasEventProxy(canvas: HTMLCanvasElement) {
    canvasEventProxy = new CanvasEventProxy(canvas);
    canvasEventProxy.on(EventType.click, (e) => {
        console.log(e);
        let gl_Position = convertPositionToWebGLPosition(e, canvas)
        console.log(gl_Position);
        points.push(gl_Position.x, gl_Position.y);
    })
}

function initShaders(gl: WebGL2RenderingContext) {
    let vs = `#version 300 es
    in vec3 a_position;
    uniform mat4 uModelMatrix;

    void main() {
        gl_Position = vec4(a_position, 1.0);
        gl_Position = uModelMatrix * gl_Position;
        // gl_PointSize = 10.0;
    }

    `
    let fs = `#version 300 es
    precision mediump float;
    uniform vec3 uColor;
    out vec4 FragColor;
    void main() {
        FragColor = vec4(uColor, 1.0);
    }
    `
    let shaders = new Shader(gl, vs, fs);
    return shaders;

}

function render(gl: WebGL2RenderingContext, program: Program, uniforms: Uniforms, vertexArray: VertexArray) {
    gl.clearColor(1, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    color.offsetHSL(0.005, 0, 0);
    program.setUniforms(uniforms);
    // vertexArray.updateAttributeData("a_position", new Float32Array(points));
    let num = points.length / 3;
    gl.drawArrays(gl.LINES, 0, num);

    requestAnimationFrame(() => {
        render(gl, program, uniforms, vertexArray);
    });
}


function getCubePoints(center: Vector3, size: Vector3) {
    let points = [];
    for (let i = 0; i < 8; i++) {
        let x = i & 1 ? size.x / 2 : -size.x / 2;
        let y = i & 2 ? size.y / 2 : -size.y / 2;
        let z = i & 4 ? size.z / 2 : -size.z / 2;
        points.push(new Vector3(x + center.x, y + center.y, z + center.z));
    }

    // 按棱柱顺序
    let indexs = [
        0, 1,
        1, 3,
        3, 2,
        2, 0,

        4, 5,
        5, 7,
        7, 6,
        6, 4,

        0, 4,
        1, 5,
        2, 6,
        3, 7
    ]
    let res: number[] = []
     indexs.map((index) => {
        res.push(...points[index].toArray())
    })
    return res;
}

</script>
<template>
    <div>
        <canvas ref="canvasContainer" width="400" height="400"></canvas>
        <el-card style="width: 320px" shadow="hover">
            <el-form ref="form" label-width="80px">
                <el-form-item label="x">
                    <el-slider v-model="compState.offset.x" :min="-1" :max="1" :step="0.01"></el-slider>
                </el-form-item>
                <el-form-item label="y">
                    <el-slider v-model="compState.offset.y" :min="-1" :max="1" :step="0.01"></el-slider>
                </el-form-item>
                <el-form-item label="z">
                    <el-slider v-model="compState.offset.z" :min="-1" :max="1" :step="0.01"></el-slider>
                </el-form-item>
                <el-form-item label="rx">
                    <el-slider v-model="compState.rotate.x" :min="0" :max="360" :step="1"></el-slider>
                </el-form-item>
                <el-form-item label="ry">
                    <el-slider v-model="compState.rotate.y" :min="0" :max="360" :step="1"></el-slider>
                </el-form-item>
                <el-form-item label="rz">
                    <el-slider v-model="compState.rotate.z" :min="0" :max="360" :step="1"></el-slider>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>