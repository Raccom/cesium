import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cesium()],
  server: {
    port: 9090,
    strictPort: true, // 严格端口 true:如果端口已被使用，则直接退出，而不会再进行后续端口的尝试。
    /**
     * @description 解决chrome设置origin:*也跨域机制,代理/api前缀到服务基地址
     * 最终的地址会将axios设置的baseUrl:/api代理拼接成[target][/api],然后通过rewrite重写掉/api为'' 这样就是我们真实的基地址了
     */
    proxy: {
      '/api': {
        target: 'http://192.168.2.231:10086', // 接口基地址
        rewrite: path => {
          console.log(path); // 打印[/api/userInfo] 这就是http-proxy要请求的url,我们基地址实际是没有/api 所以replace掉
          return path.replace(/^\/api/, '');
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.', 'src') // 设置 @ 指向 src
    }
  },
})
