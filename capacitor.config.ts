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
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#1a1a1a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;
