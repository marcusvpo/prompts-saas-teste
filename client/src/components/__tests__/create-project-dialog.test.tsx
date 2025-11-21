import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateProjectDialog } from "../create-project-dialog";
import type { ReactNode } from "react";

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("CreateProjectDialog", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  it("should render dialog when open", () => {
    render(
      <CreateProjectDialog isOpen={true} onClose={mockOnOpenChange} onSubmit={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Criar Novo Projeto")).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    render(
      <CreateProjectDialog isOpen={false} onClose={mockOnOpenChange} onSubmit={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("Criar Novo Projeto")).not.toBeInTheDocument();
  });

  it("should show validation error for empty title", async () => {
    const user = userEvent.setup();

    render(
      <CreateProjectDialog isOpen={true} onClose={mockOnOpenChange} onSubmit={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole("button", { name: /criar projeto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/o título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it("should show validation error for title too long", async () => {
    const user = userEvent.setup();

    render(
      <CreateProjectDialog isOpen={true} onClose={mockOnOpenChange} onSubmit={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByLabelText(/título/i);
    await user.type(titleInput, "a".repeat(101));

    const submitButton = screen.getByRole("button", { name: /criar projeto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/o título deve ter no máximo 100 caracteres/i)).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(
      <CreateProjectDialog isOpen={true} onClose={mockOnOpenChange} onSubmit={mockSubmit} />,
      { wrapper: createWrapper() }
    );

    const titleInput = screen.getByLabelText(/título/i);
    await user.type(titleInput, "Test Project");

    const descriptionInput = screen.getByLabelText(/descrição/i);
    await user.type(descriptionInput, "Test Description");

    const submitButton = screen.getByRole("button", { name: /criar projeto/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: "Test Project",
        description: "Test Description",
      });
    });
  });
});
