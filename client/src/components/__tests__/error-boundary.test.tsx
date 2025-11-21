import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

// Component that throws an error
const ThrowError = () => {
  throw new Error("Test error");
};

// Component that doesn't throw
const NoError = () => <div>No error</div>;

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("should render fallback UI when there is an error", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /recarregar página/i })).toBeInTheDocument();
  });

  it("should log error to logger when error occurs", () => {
    const loggerSpy = vi.spyOn(console, "error");

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(loggerSpy).toHaveBeenCalled();
  });
});
