<script setup lang="ts">
import { defineAsyncComponent, reactive, type Component } from 'vue';
import MenuItem from './components/MenuItem.vue';
import { ch01 } from './views/ch01/routes';
import { ch02 } from './views/ch02/routes';
import { ch03 } from './views/ch03/routes';

type MenuT = {
  name: string;
  comp?: Component;
  children?: MenuT[];
};

const menus: MenuT[] = [
  ch01,ch02, ch03
]

const state = reactive({
  current: menus[0]
})

function handleClick(item: MenuT) {
  state.current = item;
}

</script>

<template>
  <div class="app">
    <div class="sideMenu">
      <el-menu>
        <MenuItem v-for="item in menus" :key="item.name" :menu="item"
          @menu-click="(event: MenuT) => handleClick(event)" />
      </el-menu>
    </div>
    <div class="content">
      <component :is="state.current.comp" />
    </div>
  </div>
</template>

<style scoped lang="less">
.app {
  display: flex;
  height: 100vh;
  width: 100vw;

  .sideMenu {
    width: 200px;
    background-color: #f5f5f5;
  }
}
</style>
