<script setup lang="ts">

import { ref, onMounted, reactive } from 'vue'

const canvasContainer = ref<HTMLCanvasElement>();
const state = reactive({
    r: 255,
    g: 255,
    b: 0,
})

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
    let red = state.r / 255;
    let green = state.g / 255;
    let blue = state.b / 255;
    gl.clearColor(red, green, blue, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(() => {
        render(gl);
    });
}

</script>
<template>
    <div>
        <canvas ref="canvasContainer" width="400" height="400"></canvas>
        <el-card style="width: 320px" shadow="hover">
            <el-form ref="form" label-width="80px">
                <el-form-item label="R">
                    <el-slider v-model="state.r" :min="0" :max="255"></el-slider>
                </el-form-item>
                <el-form-item label="G">
                    <el-slider v-model="state.g" :min="0" :max="255"></el-slider>
                </el-form-item>
                <el-form-item label="B">
                    <el-slider v-model="state.b" :min="0" :max="255"></el-slider>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>