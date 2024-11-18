import type { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.knowbia.app',
  appName: 'Knowbia',
  webDir: 'dist',

  server: {
    url: 'http://10.0.0.200:9090',
    cleartext: true,
  }
};

export default config;
