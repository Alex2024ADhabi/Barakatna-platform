import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ApiDocumentation, ApiEndpoint } from "./api-documentation";

describe("ApiDocumentation", () => {
  const mockEndpoints = [
    {
      method: "GET",
      path: "/api/users",
      description: "Get all users",
      authentication: true,
    },
    {
      method: "POST",
      path: "/api/users",
      description: "Create a new user",
      authentication: true,
      requestBody: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
        },
      },
      responseBody: {
        type: "object",
        properties: {
          id: { type: "string", example: "user-123" },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          createdAt: { type: "string", example: "2023-06-15T10:30:00Z" },
        },
      },
    },
  ] as const;

  it("renders all endpoints", () => {
    render(<ApiDocumentation endpoints={mockEndpoints} />);

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("/api/users")).toBeInTheDocument();
    expect(screen.getByText("Get all users")).toBeInTheDocument();

    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByText("Create a new user")).toBeInTheDocument();
  });
});

describe("ApiEndpoint", () => {
  it("renders GET endpoint correctly", () => {
    render(
      <ApiEndpoint
        method="GET"
        path="/api/users"
        description="Get all users"
        authentication={true}
      />,
    );

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("/api/users")).toBeInTheDocument();
    expect(screen.getByText("Get all users")).toBeInTheDocument();
    expect(screen.getByText("Auth Required")).toBeInTheDocument();
  });

  it("renders POST endpoint with request and response bodies", () => {
    render(
      <ApiEndpoint
        method="POST"
        path="/api/users"
        description="Create a new user"
        authentication={true}
        requestBody={{
          type: "object",
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
          },
        }}
        responseBody={{
          type: "object",
          properties: {
            id: { type: "string", example: "user-123" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
          },
        }}
      />,
    );

    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByText("/api/users")).toBeInTheDocument();
    expect(screen.getByText("Create a new user")).toBeInTheDocument();

    // Request body
    expect(screen.getByText("Request Body")).toBeInTheDocument();
    expect(screen.getByText('"name"')).toBeInTheDocument();
    expect(screen.getByText('"John Doe"')).toBeInTheDocument();

    // Response body
    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(screen.getByText('"id"')).toBeInTheDocument();
    expect(screen.getByText('"user-123"')).toBeInTheDocument();
  });

  it("renders deprecated endpoint correctly", () => {
    render(
      <ApiEndpoint
        method="GET"
        path="/api/users/legacy"
        description="Legacy endpoint"
        deprecated={true}
      />,
    );

    expect(screen.getByText("GET")).toBeInTheDocument();
    expect(screen.getByText("/api/users/legacy")).toBeInTheDocument();
    expect(screen.getByText("Legacy endpoint")).toBeInTheDocument();
    expect(screen.getByText("Deprecated")).toBeInTheDocument();
  });
});
