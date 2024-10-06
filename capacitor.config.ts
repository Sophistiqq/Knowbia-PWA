import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.knowbia.app',
  appName: 'knowbia-pwa',
  webDir: 'dist',

  server: {
    url: 'http://10.0.23.245:9090',
    cleartext: true,
  }
};

export default config;
