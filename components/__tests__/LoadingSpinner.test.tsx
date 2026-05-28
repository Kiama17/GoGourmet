import { render } from "@testing-library/react-native";
import React from "react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders default spinner without crashing", () => {
    const { toJSON } = render(<LoadingSpinner />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders fullScreen container when fullScreen is true", () => {
    const { toJSON } = render(<LoadingSpinner fullScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders skeleton loaders when skeleton is true", () => {
    const { toJSON } = render(<LoadingSpinner skeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
