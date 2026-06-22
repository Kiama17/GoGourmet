import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import EmptyState from "../EmptyState";

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider><ThemeProvider>{ui}</ThemeProvider></LanguageProvider>);
}

describe("EmptyState", () => {
  it("renders title", () => {
    renderWithProviders(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    renderWithProviders(<EmptyState title="Empty" subtitle="Add some items" />);
    expect(screen.getByText("Add some items")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    renderWithProviders(<EmptyState title="Empty" />);
    expect(screen.queryByText("Add some items")).toBeNull();
  });

  it("renders CTA button when label and handler provided", () => {
    renderWithProviders(
      <EmptyState
        title="Empty"
        ctaLabel="Browse Food"
        onCtaPress={() => {}}
      />,
    );
    expect(screen.getByText("Browse Food")).toBeTruthy();
  });

  it("does not render CTA when label missing", () => {
    renderWithProviders(<EmptyState title="Empty" onCtaPress={() => {}} />);
    expect(screen.queryByText("Browse Food")).toBeNull();
  });

  it("does not render CTA when handler missing", () => {
    renderWithProviders(<EmptyState title="Empty" ctaLabel="Browse Food" />);
    expect(screen.queryByText("Browse Food")).toBeNull();
  });

  it("calls onCtaPress when CTA is pressed", () => {
    const onPress = jest.fn();
    renderWithProviders(
      <EmptyState title="Empty" ctaLabel="Browse" onCtaPress={onPress} />,
    );
    fireEvent.press(screen.getByText("Browse"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
