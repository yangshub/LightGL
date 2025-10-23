<script setup lang="ts">
import { reactive, type Component } from 'vue';


type MenuT = {
    name: string;
    comp?: Component;
    children?: MenuT[];
};

const props = defineProps<{
    menu: MenuT;
}>();

const emit = defineEmits<{
    (e: 'menu-click', menu: MenuT): void;
}>();

</script>
<template>
    <el-menu-item v-if="!menu.children" @click="emit('menu-click', menu)" :index="menu.name">
        {{ menu.name }}
    </el-menu-item>
    <el-sub-menu v-else :index="menu.name">
        <template #title>
            {{ menu.name }}
        </template>
        <MenuItem v-for="item in menu.children" :key="item.name" :menu="item" @menu-click="emit('menu-click', $event)" />
    </el-sub-menu>
</template>