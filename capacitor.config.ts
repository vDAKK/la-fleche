import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dakk.lafleche',
  appName: 'La Flèche',
  webDir: 'dist',
  android: {
    versionCode: 674,  // Auto-généré par le script bump-version.js
    versionName: '1.0.2'  // Auto-généré par le script bump-version.js
  },
  ios: {
    buildNumber: '674',  // Auto-généré par le script bump-version.js
    version: '1.0.2'  // Auto-généré par le script bump-version.js
  }
};

export default config;
