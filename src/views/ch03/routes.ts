import { defineAsyncComponent } from 'vue';

export const ch03 = {
  name: 'ch03 第三章 空间变换',
  children: [
    {
      name: '01 矩阵平移',
      comp: defineAsyncComponent(() => import('./demo01/index.vue')),
    },
    {
      name: '02 矩阵旋转',
      comp: defineAsyncComponent(() => import('./demo02/index.vue')),
    },
      {
      name: '03 矩阵 + 平移',
      comp: defineAsyncComponent(() => import('./demo03/index.vue')),
    },
  ],
};
