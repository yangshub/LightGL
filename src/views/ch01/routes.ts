import { defineAsyncComponent } from 'vue';

export const ch01 = {
  name: 'ch01 第一章 入门',
  children: [
    {
      name: '01 刷底色',
      comp: defineAsyncComponent(() => import('./demo01/index.vue')),
    },
    {
      name: '02 多姿多彩的画布',
      comp: defineAsyncComponent(() => import('./demo02/index.vue')),
    },
    {
      name: '03 画一个点',
      comp: defineAsyncComponent(() => import('./demo03/index.vue')),
    },
    {
      name: '04 画一个圆点',
      comp: defineAsyncComponent(() => import('./demo04/index.vue')),
    },
    {
      name: '05 鼠标绘制多点',
      comp: defineAsyncComponent(() => import('./demo05/index.vue')),
    },
  ],
};
