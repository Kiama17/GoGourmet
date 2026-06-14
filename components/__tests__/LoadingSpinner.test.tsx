import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import LoadingSpinner from "../LoadingSpinner";

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("LoadingSpinner", () => {
  it("renders default spinner without crashing", () => {
    const { toJSON } = renderWithProviders(<LoadingSpinner />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders fullScreen container when fullScreen is true", () => {
    const { toJSON } = renderWithProviders(<LoadingSpinner fullScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders skeleton loaders when skeleton is true", () => {
    const { toJSON } = renderWithProviders(<LoadingSpinner skeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
