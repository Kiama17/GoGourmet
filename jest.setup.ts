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
