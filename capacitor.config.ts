import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.lafleche',
  appName: 'flight-point-master',
  webDir: 'dist',
  server: {
    url: 'https://63388a63-10ac-40b6-91af-dcee1bd8ff6f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
