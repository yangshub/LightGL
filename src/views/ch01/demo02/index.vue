<script setup lang="ts">
import { Color } from '@source/maths';
import { ref, onMounted, reactive } from 'vue'

const canvasContainer = ref<HTMLCanvasElement>();

const color = new Color("#ff0000");

onMounted(() => {
    let canvas = canvasContainer.value;
    if (canvas) {
        let webgl2RenderingContext = canvas.getContext("webgl2");
        if (webgl2RenderingContext) {
            render(webgl2RenderingContext);
        }
    }
});

function render(gl: WebGL2RenderingContext) {
    color.offsetHSL(0.005, 0, 0);
    gl.clearColor(color.r, color.g, color.b, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(() => {
        render(gl);
    });
}


</script>
<template>
    <div>
        <canvas ref="canvasContainer" width="400" height="400"></canvas>
    </div>
</template>
<style scoped lang="less"></style>