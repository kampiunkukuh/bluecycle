import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bluecycle.app',
  appName: 'BlueCycle',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      permissions: ['LOCATION_COARSE', 'LOCATION_FINE'],
    },
    Camera: {
      permissions: ['CAMERA', 'PHOTOS'],
    },
  },
};

export default config;
