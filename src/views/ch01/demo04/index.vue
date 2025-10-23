<script setup lang="ts">
import { Program, Shader, type Uniforms } from '@source/index';
import { Color } from '@source/maths';
import { ref, onMounted, reactive } from 'vue'

const canvasContainer = ref<HTMLCanvasElement>();

const color = new Color("#ff0000");

onMounted(() => {
    let canvas = canvasContainer.value;
    if (canvas) {
        let webgl2RenderingContext = canvas.getContext("webgl2");
        if (webgl2RenderingContext) {
            initLightGL(webgl2RenderingContext);
        }
    }
});

function initLightGL(gl: WebGL2RenderingContext) {
    // gl.clearColor(1, 1, 0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    let shaders = initShaders(gl);
    let program = new Program(gl, shaders);
    let uniforms = {
        uColor: () => {
            return color.toArray();
        },
        u_position: [0.5, 0.5]
    };


    program.useProgram();
    program.setUniforms(uniforms);


    render(gl, program, uniforms);

}

function render(gl: WebGL2RenderingContext, program: Program, uniforms: Uniforms) {
    color.offsetHSL(0.005, 0, 0);
    program.useProgram();
    program.setUniforms(uniforms);
    gl.clearColor(1, 1, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);

    requestAnimationFrame(() => {
        render(gl, program, uniforms);
    });
}

function initShaders(gl: WebGL2RenderingContext) {
    let vs = `#version 300 es
    uniform vec2 u_position;
    out vec2 vPosition;

    void main() {
        gl_Position = vec4(u_position, 0.0, 1.0);
        vPosition = u_position;
        gl_PointSize = 40.0;
    }

    `
    let fs = `#version 300 es
    precision mediump float;
    uniform vec3 uColor;
    in vec2 vPosition;
    out vec4 FragColor;
    void main() {

        float distance = distance(vPosition, gl_PointCoord);
        if (distance > 0.5) {
            discard;
        } else {
            FragColor = vec4(uColor, 1.0);
        }
        
    }
    `
    let shaders = new Shader(gl, vs, fs);
    return shaders;
}


</script>
<template>
    <div>
        <canvas ref="canvasContainer" width="400" height="400"></canvas>
    </div>
</template>
<style scoped lang="less"></style>