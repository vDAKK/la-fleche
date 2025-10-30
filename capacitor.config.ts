import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dakk.lafleche',
  appName: 'La Flèche',
  webDir: 'dist',
  android: {
    versionCode: 1,
    versionName: '1.0.0'
  }
};

export default config;
