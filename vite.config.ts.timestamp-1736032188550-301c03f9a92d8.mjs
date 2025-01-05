// vite.config.ts
import { VitePWA } from "file:///home/roi/Desktop/v2-Knowbia/Knowbia-PWA/node_modules/vite-plugin-pwa/dist/index.js";
import { defineConfig } from "file:///home/roi/Desktop/v2-Knowbia/Knowbia-PWA/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///home/roi/Desktop/v2-Knowbia/Knowbia-PWA/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
var vite_config_default = defineConfig({
  plugins: [svelte(), VitePWA({
    strategies: "injectManifest",
    srcDir: "src",
    filename: "sw.ts",
    registerType: "autoUpdate",
    injectRegister: false,
    pwaAssets: {
      disabled: false,
      config: true
    },
    manifest: {
      name: "Knowbia-PWA",
      short_name: "Knowbia-PWA",
      description: "Distribute",
      theme_color: "#000",
      display: "fullscreen"
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
    },
    devOptions: {
      enabled: false,
      navigateFallback: "index.html",
      suppressWarnings: true,
      type: "module"
    }
  })],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yb2kvRGVza3RvcC92Mi1Lbm93YmlhL0tub3diaWEtUFdBXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9yb2kvRGVza3RvcC92Mi1Lbm93YmlhL0tub3diaWEtUFdBL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3JvaS9EZXNrdG9wL3YyLUtub3diaWEvS25vd2JpYS1QV0Evdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBzdmVsdGUgfSBmcm9tICdAc3ZlbHRlanMvdml0ZS1wbHVnaW4tc3ZlbHRlJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3N2ZWx0ZSgpLCBWaXRlUFdBKHtcbiAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgIHNyY0RpcjogJ3NyYycsXG4gICAgZmlsZW5hbWU6ICdzdy50cycsXG4gICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgaW5qZWN0UmVnaXN0ZXI6IGZhbHNlLFxuXG4gICAgcHdhQXNzZXRzOiB7XG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBjb25maWc6IHRydWUsXG4gICAgfSxcbiAgICBtYW5pZmVzdDoge1xuICAgICAgbmFtZTogJ0tub3diaWEtUFdBJyxcbiAgICAgIHNob3J0X25hbWU6ICdLbm93YmlhLVBXQScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Rpc3RyaWJ1dGUnLFxuICAgICAgdGhlbWVfY29sb3I6ICcjMDAwJyxcbiAgICAgIGRpc3BsYXk6ICdmdWxsc2NyZWVuJ1xuICAgIH0sXG5cbiAgICBpbmplY3RNYW5pZmVzdDoge1xuICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLHN2ZyxwbmcsaWNvfSddLFxuICAgIH0sXG5cbiAgICBkZXZPcHRpb25zOiB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIG5hdmlnYXRlRmFsbGJhY2s6ICdpbmRleC5odG1sJyxcbiAgICAgIHN1cHByZXNzV2FybmluZ3M6IHRydWUsXG4gICAgICB0eXBlOiAnbW9kdWxlJyxcbiAgICB9LFxuICB9KV0sXG5cbiAgY3NzOiB7XG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgc2Nzczoge1xuICAgICAgICBhcGk6ICdtb2Rlcm4nXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUyxTQUFTLGVBQWU7QUFDbFUsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxjQUFjO0FBR3ZCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxPQUFPLEdBQUcsUUFBUTtBQUFBLElBQzFCLFlBQVk7QUFBQSxJQUNaLFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLGdCQUFnQjtBQUFBLElBRWhCLFdBQVc7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixhQUFhO0FBQUEsTUFDYixhQUFhO0FBQUEsTUFDYixTQUFTO0FBQUEsSUFDWDtBQUFBLElBRUEsZ0JBQWdCO0FBQUEsTUFDZCxjQUFjLENBQUMsZ0NBQWdDO0FBQUEsSUFDakQ7QUFBQSxJQUVBLFlBQVk7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULGtCQUFrQjtBQUFBLE1BQ2xCLGtCQUFrQjtBQUFBLE1BQ2xCLE1BQU07QUFBQSxJQUNSO0FBQUEsRUFDRixDQUFDLENBQUM7QUFBQSxFQUVGLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLEtBQUs7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
