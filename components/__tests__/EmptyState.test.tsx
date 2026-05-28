import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import EmptyState from "../EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    render(<EmptyState title="Empty" subtitle="Add some items" />);
    expect(screen.getByText("Add some items")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText("Add some items")).toBeNull();
  });

  it("renders CTA button when label and handler provided", () => {
    render(
      <EmptyState
        title="Empty"
        ctaLabel="Browse Food"
        onCtaPress={() => {}}
      />,
    );
    expect(screen.getByText("Browse Food")).toBeTruthy();
  });

  it("does not render CTA when label missing", () => {
    render(<EmptyState title="Empty" onCtaPress={() => {}} />);
    expect(screen.queryByText("Browse Food")).toBeNull();
  });

  it("does not render CTA when handler missing", () => {
    render(<EmptyState title="Empty" ctaLabel="Browse Food" />);
    expect(screen.queryByText("Browse Food")).toBeNull();
  });

  it("calls onCtaPress when CTA is pressed", () => {
    const onPress = jest.fn();
    render(
      <EmptyState title="Empty" ctaLabel="Browse" onCtaPress={onPress} />,
    );
    fireEvent.press(screen.getByText("Browse"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
