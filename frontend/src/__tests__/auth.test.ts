import { getToken, setToken, clearToken, isAuthenticated } from "../lib/auth";

describe("Auth Storage Helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getToken returns null when no token is in storage", () => {
    expect(getToken()).toBeNull();
  });

  test("setToken stores access_token in localStorage", () => {
    setToken("jwt-mock-token-xyz");
    expect(localStorage.getItem("access_token")).toBe("jwt-mock-token-xyz");
    expect(getToken()).toBe("jwt-mock-token-xyz");
  });

  test("clearToken removes access_token from localStorage", () => {
    setToken("jwt-mock-token-xyz");
    clearToken();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(getToken()).toBeNull();
  });

  test("isAuthenticated accurately reflects token presence", () => {
    expect(isAuthenticated()).toBe(false);
    setToken("active-token");
    expect(isAuthenticated()).toBe(true);
    clearToken();
    expect(isAuthenticated()).toBe(false);
  });
});
