import { defineAsyncComponent } from 'vue';

export const ch02 = {
  name: 'ch02 第二章 三角形',
  children: [
    {
      name: '01 绘制三角形',
      comp: defineAsyncComponent(() => import('./demo01/index.vue')),
    },
    {
      name: '02 绘制四边形',
      comp: defineAsyncComponent(() => import('./demo02/index.vue')),
    },
    {
      name: '03 绘制线',
      comp: defineAsyncComponent(() => import('./demo03/index.vue')),
    },
    {
      name: '04 绘制线02',
      comp: defineAsyncComponent(() => import('./demo04/index.vue')),
    },
    {
      name: '05 绘制线03',
      comp: defineAsyncComponent(() => import('./demo05/index.vue')),
    },
     {
      name: '06 绘制独立三角形',
      comp: defineAsyncComponent(() => import('./demo06/index.vue')),
    }, {
      name: '07 三角带',
      comp: defineAsyncComponent(() => import('./demo07/index.vue')),
    },{
      name: '08 三角扇',
      comp: defineAsyncComponent(() => import('./demo08/index.vue')),
    },
  ],
};
