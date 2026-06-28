export {};

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as any).__DEV__ = true;
(globalThis as any).requestAnimationFrame = (callback: any) => setTimeout(callback, 0);
(globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
(globalThis as any).performance = { now: jest.fn(Date.now) };
(globalThis as any).nativeFabricUIManager = {};
(globalThis as any).regeneratorRuntime = undefined;
(globalThis as any).window = globalThis;
(globalThis as any).Window = globalThis;

class MockEventEmitter {}
Object.assign(globalThis, {
  expo: { EventEmitter: MockEventEmitter },
});

jest.mock("expo-modules-core", () => {
  class EventEmitter {
    addListener = jest.fn(() => ({ remove: jest.fn() }));
    emit = jest.fn();
    removeAllListeners = jest.fn();
    removeListener = jest.fn();
  }
  class CodedError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
  class UnavailabilityError extends Error {
    constructor(moduleName: string, propertyName: string) {
      super(`The method or property ${moduleName}.${propertyName} is not available on this platform`);
    }
  }
  class NativeModule {}
  class SharedObject {}
  class SharedRef {}

  const requireNativeModule = jest.fn(() => ({}));
  const requireOptionalNativeModule = jest.fn(() => ({}));
  const requireNativeViewManager = jest.fn(() => "View");
  const registerWebModule = jest.fn((mod) => mod);
  const uuid = { v4: jest.fn(() => "00000000-0000-0000-0000-000000000000"), v5: jest.fn() };

  return {
    EventEmitter,
    CodedError,
    UnavailabilityError,
    NativeModule,
    SharedObject,
    SharedRef,
    Platform: { OS: "web", version: "1.0", isDOMAvailable: true, isNative: false },
    uuid,
    requireNativeModule,
    requireOptionalNativeModule,
    requireNativeViewManager,
    registerWebModule,
    get installOnUIRuntime() { return jest.fn(); },
  };
});

jest.mock("react-native-url-polyfill/auto", () => ({}), { virtual: true });

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const mockSupabaseQuery = {
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
  update: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  delete: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
};

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: "test-id", email: "test@test.com" } }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: { user: { id: "test-id", email: "test@test.com" } }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  from: jest.fn(() => mockSupabaseQuery),
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: {}, error: null })),
  },
};

jest.mock("../services/supabaseClient", () => ({
  supabase: mockSupabaseClient,
}), { virtual: true });

jest.mock("./services/supabaseClient", () => ({
  supabase: mockSupabaseClient,
}), { virtual: true });

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  Tabs: ({ children }: any) => children,
}));

jest.mock("expo-constants", () => ({
  default: {
    manifest: {},
    executionEnvironment: "storeClient",
    expoConfig: {
      extra: {
        supabaseUrl: "https://test.supabase.co",
        supabaseAnonKey: "test-key",
      },
    },
  },
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  renderToImageAsync: jest.fn(() => Promise.resolve("")),
  getOptionalNativeModule: jest.fn(),
  requireOptionalNativeModule: jest.fn(),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "undetermined" }),
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: "test-token" }),
  ),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock("expo-device", () => ({
  isDevice: true,
}));
