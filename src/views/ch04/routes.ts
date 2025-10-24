import { defineAsyncComponent } from 'vue';

export const ch04 = {
  name: 'ch04 第四章 相机',
  children: [
    {
      name: '01 正交投影相机',
      comp: defineAsyncComponent(() => import('./demo01/index.vue')),
    },
    
  ],
};
