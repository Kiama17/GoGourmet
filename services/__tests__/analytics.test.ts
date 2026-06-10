import { analytics } from "../analytics";

describe("analytics", () => {
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    spy.mockClear();
  });

  afterAll(() => {
    spy.mockRestore();
  });

  it("logs order_placed event", () => {
    analytics.track("order_placed", { order_id: "abc", total: 1500 });
    expect(spy).toHaveBeenCalledWith("[Analytics] order_placed", {
      order_id: "abc",
      total: 1500,
    });
  });

  it("logs user_logged_in event", () => {
    analytics.track("user_logged_in", { user_id: "u1" });
    expect(spy).toHaveBeenCalledWith("[Analytics] user_logged_in", { user_id: "u1" });
  });

  it("logs payment_failed event", () => {
    analytics.track("payment_failed", { error: "timeout" });
    expect(spy).toHaveBeenCalledWith("[Analytics] payment_failed", { error: "timeout" });
  });

  it("logs event without properties", () => {
    analytics.track("user_logged_out");
    expect(spy).toHaveBeenCalledWith("[Analytics] user_logged_out", "");
  });

  it("does not throw on any event name", () => {
    expect(() => analytics.track("order_placed")).not.toThrow();
  });
});
