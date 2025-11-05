import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dakk.lafleche',
  appName: 'La Flèche',
  webDir: 'dist',
  android: {
    versionCode: 2,  // Augmenter de 1 à chaque build
    versionName: '1.0.1'  // Version affichée (1.0.0 → 1.0.1 → 1.1.0, etc.)
  },
  ios: {
    buildNumber: '2',  // Augmenter de 1 à chaque build (string)
    version: '1.0.1'  // Version affichée
  }
};

export default config;
