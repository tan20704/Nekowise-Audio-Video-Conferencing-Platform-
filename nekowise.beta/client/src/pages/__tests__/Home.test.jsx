import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../Home";
import { AuthProvider } from "../../contexts/AuthContext";

// Mock the AuthContext
vi.mock("../../contexts/AuthContext", () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}));

describe("Home", () => {
  it("renders the landing page with main heading", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(
      screen.getByText(/Connect Face-to-Face, Instantly/i)
    ).toBeInTheDocument();
  });

  it("renders the Nekowise branding", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Nekowise/i)[0]).toBeInTheDocument();
  });

  it("renders join meeting input", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText(/Enter Meeting Link/i)
    ).toBeInTheDocument();
  });

  it("renders create meeting button", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Create New Meeting/i)).toBeInTheDocument();
  });

  it("renders join meeting button", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Join Meeting/i)).toBeInTheDocument();
  });
});
