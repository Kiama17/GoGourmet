const APP_ENV = process.env.APP_ENV || "development";

type EnvConfig = {
  name: string;
  slug: string;
  bundleIdentifier: string;
  androidPackage: string;
  icon: string;
  version: string;
};

const envConfigs: Record<string, EnvConfig> = {
  development: {
    name: "GoGourmet Dev",
    slug: "gogourmet-dev",
    bundleIdentifier: "com.gogourmet.dev",
    androidPackage: "com.gogourmet.dev",
    icon: "./assets/images/logo.png",
    version: "1.0.0",
  },
  staging: {
    name: "GoGourmet Staging",
    slug: "gogourmet-staging",
    bundleIdentifier: "com.gogourmet.staging",
    androidPackage: "com.gogourmet.staging",
    icon: "./assets/images/logo.png",
    version: "1.0.0",
  },
  production: {
    name: "GoGourmet",
    slug: "gogourmet",
    bundleIdentifier: "com.gogourmet.app",
    androidPackage: "com.gogourmet.app",
    icon: "./assets/images/logo.png",
    version: "1.0.0",
  },
};

const env = envConfigs[APP_ENV] || envConfigs.development;

export default {
  expo: {
    name: env.name,
    slug: env.slug,
    version: env.version,
    orientation: "portrait",
    icon: env.icon,
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: env.bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: env.androidPackage,
      adaptiveIcon: {
        foregroundImage: env.icon,
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "",
        },
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    web: {
      favicon: "./assets/images/avatar.png",
      bundler: "metro",
    },
    scheme: "gogourmet",
    plugins: [
      "expo-router",
      "expo-build-properties",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow GoGourmet to use your location to set delivery address.",
          locationWhenInUsePermission:
            "Allow GoGourmet to use your location to set delivery address.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: env.icon,
          color: "#ff6b00",
        },
      ],
      "expo-font",
      "expo-image",
      "expo-status-bar",
      "sentry-expo",
    ],
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
      nvidiaApiKey: process.env.NVIDIA_API_KEY || "",
      supabaseUrl: process.env.SUPABASE_URL || "https://fvkqqhrwnhwstbyophnc.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
      amplitudeApiKey: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY || "",
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
      appEnv: APP_ENV,
      eas: {
        projectId: "1364470b-a522-4860-b2ba-53288a2c48be",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/1364470b-a522-4860-b2ba-53288a2c48be",
    },
  },
};
