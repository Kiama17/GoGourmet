module.exports = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-maps|@testing-library/react-native)",
  ],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/__mocks__/react-native.js",
    "^react-native-vector-icons$": "@expo/vector-icons",
    "^react-native-vector-icons/(.*)": "@expo/vector-icons/$1",
    "^.+\\.ttf$": "<rootDir>/__mocks__/fileMock.js",
  },
};
