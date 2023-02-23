import { defineConfig } from 'umi';

export default defineConfig({
  dynamicImport: {},
  history: {
    type: 'hash',
  },
  publicPath: '/front/',
  nodeModulesTransform: {
    type: 'all',
  },
  targets: {
    //配置浏览器最低版本,比如兼容ie11
    ie: 11,
  },
  dva: {
    hmr: true,
    immer: { enableES5: true },
  }, //如需兼容 IE11，需配置 },
  routes: [
    {
      path: '/',
      component: '@/layout/index.tsx',
      routes: [
        { path: '/', component: '@/pages/index', title: '药品信息检索' },
        { path: '/index', component: '@/pages/index', title: '药品信息检索' },
        {
          path: '/Ingredients',
          component: '@/pages/Ingredients',
          title: '辅料信息维护',
        },
        { path: '/Drugs', component: '@/pages/Drugs', title: '药品信息维护' },
      ],
    },
  ],
  fastRefresh: {},

  proxy: {
    '/api': {
      target: 'http://localhost:51055', // 接口域名
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
