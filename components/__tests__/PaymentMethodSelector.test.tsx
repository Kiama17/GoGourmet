import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";
import PaymentMethodSelector from "../PaymentMethodSelector";

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider><ThemeProvider>{ui}</ThemeProvider></LanguageProvider>);
}

describe("PaymentMethodSelector", () => {
  it("renders both payment options", () => {
    renderWithProviders(
      <PaymentMethodSelector selected="cod" onSelect={() => {}} total={1000} />,
    );
    expect(screen.getByText("Cash on Delivery")).toBeTruthy();
    expect(screen.getByText("M-Pesa")).toBeTruthy();
  });

  it("renders descriptions for each method", () => {
    renderWithProviders(
      <PaymentMethodSelector selected="cod" onSelect={() => {}} total={1000} />,
    );
    expect(
      screen.getByText("Pay with cash when your order arrives"),
    ).toBeTruthy();
    expect(
      screen.getByText("Pay instantly via M-Pesa STK Push"),
    ).toBeTruthy();
  });

  it("calls onSelect when Cash on Delivery is pressed", () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <PaymentMethodSelector
        selected="mpesa"
        onSelect={onSelect}
        total={1000}
      />,
    );
    fireEvent.press(screen.getByText("Cash on Delivery"));
    expect(onSelect).toHaveBeenCalledWith("cod");
  });

  it("calls onSelect when M-Pesa is pressed", () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <PaymentMethodSelector
        selected="cod"
        onSelect={onSelect}
        total={1000}
      />,
    );
    fireEvent.press(screen.getByText("M-Pesa"));
    expect(onSelect).toHaveBeenCalledWith("mpesa");
  });
});
