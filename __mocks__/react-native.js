const React = require("react");

function createMockComponent(name) {
  const Component = React.forwardRef((props, ref) => {
    return React.createElement(name, { ...props, ref });
  });
  Component.displayName = name;
  return Component;
}

const AnimatedImplementation = {
  Value: class AnimatedValue {
    constructor(value) {
      this._value = value;
      this._listeners = [];
    }
    setValue(value) {
      this._value = value;
    }
    interpolate() {
      return { __isAnimated: true };
    }
    addListener(cb) {
      this._listeners.push(cb);
    }
    removeListener(id) {
      this._listeners = this._listeners.filter((l) => l !== id);
    }
    removeAllListeners() {
      this._listeners = [];
    }
  },
  timing: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  spring: () => ({
    start: (cb) => cb && cb({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  loop: (animation) => ({
    start: (cb) => {
      animation.start && animation.start(cb);
    },
    stop: () => animation.stop && animation.stop(),
    reset: () => animation.reset && animation.reset(),
  }),
  sequence: (animations) => ({
    start: (cb) => {
      animations.forEach((a) => a.start && a.start());
      cb && cb({ finished: true });
    },
    stop: () => animations.forEach((a) => a.stop && a.stop()),
    reset: () => animations.forEach((a) => a.reset && a.reset()),
  }),
  parallel: (animations) => ({
    start: (cb) => {
      animations.forEach((a) => a.start && a.start());
      cb && cb({ finished: true });
    },
    stop: () => animations.forEach((a) => a.stop && a.stop()),
    reset: () => animations.forEach((a) => a.reset && a.reset()),
  }),
  delay: (ms) => ({
    start: (cb) => setTimeout(() => cb && cb({ finished: true }), ms),
    stop: () => {},
    reset: () => {},
  }),
  event: () => jest.fn(),
  createAnimatedComponent: (Component) => {
    const Wrapped = React.forwardRef((props, ref) =>
      React.createElement(Component, { ...props, ref }),
    );
    return Wrapped;
  },
};

const AnimatedView = AnimatedImplementation.createAnimatedComponent("AnimatedView");
const AnimatedText = AnimatedImplementation.createAnimatedComponent("AnimatedText");

const mock = {
  // Components
  View: createMockComponent("View"),
  Text: createMockComponent("Text"),
  TouchableOpacity: createMockComponent("TouchableOpacity"),
  TouchableHighlight: createMockComponent("TouchableHighlight"),
  TouchableWithoutFeedback: createMockComponent("TouchableWithoutFeedback"),
  TouchableNativeFeedback: createMockComponent("TouchableNativeFeedback"),
  Pressable: createMockComponent("Pressable"),
  TextInput: createMockComponent("TextInput"),
  FlatList: createMockComponent("FlatList"),
  SectionList: createMockComponent("SectionList"),
  ScrollView: createMockComponent("ScrollView"),
  Image: createMockComponent("Image"),
  ImageBackground: createMockComponent("ImageBackground"),
  Modal: createMockComponent("Modal"),
  RefreshControl: createMockComponent("RefreshControl"),
  ActivityIndicator: createMockComponent("ActivityIndicator"),
  Switch: createMockComponent("Switch"),
  StatusBar: createMockComponent("StatusBar"),
  KeyboardAvoidingView: createMockComponent("KeyboardAvoidingView"),
  SafeAreaView: createMockComponent("SafeAreaView"),
  Button: createMockComponent("Button"),
  DrawerLayoutAndroid: createMockComponent("DrawerLayoutAndroid"),

  // APIs
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => {
      if (Array.isArray(style)) {
        return Object.assign({}, ...style);
      }
      return style;
    },
    hairlineWidth: () => 1,
    absoluteFill: {},
    absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  },
  Platform: {
    OS: "ios",
    Version: "15.0",
    select: (obj) => obj.ios ?? obj.default,
    isPad: false,
    isTV: false,
    isTesting: true,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667, scale: 2, fontScale: 1 }),
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
  },
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Animated: AnimatedImplementation,
  Keyboard: {
    addListener: () => ({ remove: () => {} }),
    removeListener: () => {},
    removeAllListeners: () => {},
    dismiss: jest.fn(),
    isVisible: () => false,
    metrics: () => null,
  },
  AppState: {
    currentState: "active",
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
  },
  Linking: {
    openURL: jest.fn().mockResolvedValue(undefined),
    canOpenURL: jest.fn().mockResolvedValue(true),
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
    openSettings: jest.fn(),
  },
  BackHandler: {
    exitApp: jest.fn(),
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
  },
  PanResponder: {
    create: (config) => ({
      panHandlers: {
        onStartShouldSetResponder: jest.fn(),
        onMoveShouldSetResponder: jest.fn(),
        onResponderGrant: config?.onStart ?? jest.fn(),
        onResponderMove: config?.onMove ?? jest.fn(),
        onResponderRelease: config?.onEnd ?? jest.fn(),
        onResponderTerminate: config?.onEnd ?? jest.fn(),
      },
    }),
  },
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => Math.round(size * 2) / 2,
    startDetecting: () => {},
  },
  Share: {
    share: jest.fn().mockResolvedValue({ action: "shared" }),
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  useColorScheme: () => "light",
  Appearance: {
    getColorScheme: () => "light",
    addChangeListener: () => ({ remove: () => {} }),
  },
  Easing: {
    step0: jest.fn(),
    step1: jest.fn(),
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: () => jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: () => jest.fn(),
    back: () => jest.fn(),
    bounce: () => jest.fn(),
    bezier: () => jest.fn(),
    in: (easing) => easing,
    out: (easing) => easing,
    inOut: (easing) => easing,
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Presets: {
      easeInEaseOut: { duration: 300, create: { type: "easeInEaseOut", property: "opacity" } },
      linear: { duration: 300, create: { type: "linear", property: "opacity" } },
      spring: { duration: 300, create: { type: "spring", property: "scaleXY" } },
    },
    Types: { easeIn: "easeIn", easeOut: "easeOut", easeInEaseOut: "easeInEaseOut", linear: "linear", spring: "spring" },
    Properties: { opacity: "opacity", scaleXY: "scaleXY" },
  },
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn(),
    getConstants: () => ({ isRTL: false, doLeftAndRightSwapInRTL: true }),
  },
  findNodeHandle: (component) => {
    if (component == null) return null;
    return 1;
  },
  processColor: (color) => color,
  requireNativeComponent: (name) => createMockComponent(name),
  unstable_batchedUpdates: (fn) => fn(),

  // Native modules
  NativeModules: {
    SettingsManager: { settings: {} },
    PlatformConstants: { forceTouchAvailable: false, isTesting: true, reactNativeVersion: { major: 0, minor: 85, patch: 3 } },
    UIManager: {},
    SourceCode: { scriptURL: "http://localhost:8081/index.bundle" },
    DeviceInfo: {},
  },
  UIManager: {
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    setNativeProps: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    manageChildren: jest.fn(),
    removeSubviewsFromContainerWithID: jest.fn(),
    replaceExistingNonRootView: jest.fn(),
    blur: jest.fn(),
    focus: jest.fn(),
    getViewManagerConfig: () => {},
    getConstants: () => ({}),
  },
  DeviceEventEmitter: {
    addListener: () => ({ remove: () => {} }),
    emit: jest.fn(),
    removeAllListeners: () => {},
    removeListener: () => {},
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    removeListener: jest.fn(),
  })),
  TurboModuleRegistry: {
    get: () => null,
    getEnforcing: () => null,
  },
  NativeComponentRegistry: {
    get: () => createMockComponent("NativeComponent"),
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
    announceForAccessibility: jest.fn(),
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
    isBoldTextEnabled: jest.fn().mockResolvedValue(false),
    isGrayscaleEnabled: jest.fn().mockResolvedValue(false),
    isInvertColorsEnabled: jest.fn().mockResolvedValue(false),
    isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
    isReduceTransparencyEnabled: jest.fn().mockResolvedValue(false),
    setAccessibilityFocus: jest.fn(),
  },
  LogBox: {
    ignoreAllLogs: jest.fn(),
    ignoreLogs: jest.fn(),
    install: jest.fn(),
    uninstall: jest.fn(),
  },
  InteractionManager: {
    runAfterInteractions: (fn) => fn(),
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn(),
  },
  AppRegistry: {
    registerComponent: jest.fn(),
    registerRunnable: jest.fn(),
    runApplication: jest.fn(),
    getAppKeys: () => [],
    setComponentProviderInstrumentationHook: jest.fn(),
    registerHeadlessTask: jest.fn(),
    registerCancellableHeadlessTask: jest.fn(),
    startHeadlessTask: jest.fn(),
    cancelHeadlessTask: jest.fn(),
    headlessTaskRunner: jest.fn(),
  },
  Systrace: {
    setEnabled: jest.fn(),
    beginEvent: jest.fn(),
    endEvent: jest.fn(),
    beginAsyncEvent: jest.fn(),
    endAsyncEvent: jest.fn(),
    installReactHook: jest.fn(),
  },
  ActionSheetIOS: {
    showActionSheetWithOptions: jest.fn(),
    showShareActionSheetWithOptions: jest.fn(),
  },
  PermissionsAndroid: {
    PERMISSIONS: {},
    RESULTS: {},
    check: jest.fn().mockResolvedValue("granted"),
    request: jest.fn().mockResolvedValue("granted"),
    requestMultiple: jest.fn().mockResolvedValue({}),
  },
  ToastAndroid: {
    show: jest.fn(),
    showWithGravity: jest.fn(),
    showWithGravityAndOffset: jest.fn(),
    SHORT: 2000,
    LONG: 3500,
    TOP: 49,
    BOTTOM: 81,
    CENTER: 17,
  },
  Settings: {
    get: jest.fn(),
    set: jest.fn(),
    watchKeys: jest.fn(() => 0),
    clearWatch: jest.fn(),
  },
};

mock.Animated.View = AnimatedView;
mock.Animated.Text = AnimatedText;
mock.Animated.Image = AnimatedView;
mock.Animated.ScrollView = AnimatedView;
mock.Animated.FlatList = AnimatedView;
mock.Animated.SectionList = AnimatedView;

module.exports = mock;
