<script setup lang="ts">
import { Color, Program, Shader, type Uniforms } from "@source/index";
import { CanvasEventProxy, convertPositionToWebGLPosition, EventType } from "@source/render/CanvasEventProxy";
import { VertexArray } from "@source/render/VertexArray";
import { ref, onMounted, onUnmounted } from "vue";

const canvasContainer = ref<HTMLCanvasElement | null>(null);
let canvasEventProxy: CanvasEventProxy;
const color = new Color(1, 0, 0);

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

const points = [
    -0.2, 0.2,
    -0.2, -0.2,
    0.2, 0.2,
    0.2, -0.2,
] as number[];

function initLightGL(gl: WebGL2RenderingContext) {
    // gl.clearColor(1, 1, 0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    let shaders = initShaders(gl);
    let program = new Program(gl, shaders);
    let uniforms = {
        uColor: () => {
            return color.toArray();
        }
    };
    let vertexArray = new VertexArray(gl);

    vertexArray.adddAttribute({
        name: "a_position",
        size: 2,
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
    in vec2 a_position;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
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
    vertexArray.updateAttributeData("a_position", new Float32Array(points));
    let num = points.length / 2;
    gl.drawArrays(gl.LINES, 0, num);

    requestAnimationFrame(() => {
        render(gl, program, uniforms, vertexArray);
    });
}

</script>
<template>
    <div>
        <canvas ref="canvasContainer" width="400" height="400"></canvas>
    </div>
</template>