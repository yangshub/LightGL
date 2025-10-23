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

const state = reactive({
    isSubMenuOpen: false,
});

</script>
<template>
    <div class="menu" v-if="props.menu?.comp" @click="emit('menu-click', props.menu)">
        {{ props.menu.name }}
    </div>
    <div class="menu-group" v-else>
        <div class="menu-group-title" @click="state.isSubMenuOpen = !state.isSubMenuOpen">
            <div>{{ props.menu.name }}</div>
            <div>{{ state.isSubMenuOpen ? '▼'  :  '▶'}}</div>
        </div>
        <div class="menu-group-content" v-if="state.isSubMenuOpen">
            <Menu v-for="item in props.menu.children" :key="item.name" :menu="item"
                @menu-click="emit('menu-click', $event)" />
        </div>

    </div>
</template>
<style scoped lang="less">
.menu {
    padding: 5px;
    background-color: #eee;
    border-radius: 5px;
    margin: 5px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease-in-out;
    color: #333;
    line-height: 32px;


    &:hover {
        background-color: #ddd;
    }
}

.menu-group {
    padding: 5px;

    .menu-group-title {
        background-color: #eee;
        border-radius: 5px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s ease-in-out;
        color: #333;
        line-height: 32px;
        padding: 5px;
        display: flex;
        justify-content: space-between;

        &:hover {
            background-color: #ddd;
        }
    }

    .menu-group-content {
        
    }
}
</style>