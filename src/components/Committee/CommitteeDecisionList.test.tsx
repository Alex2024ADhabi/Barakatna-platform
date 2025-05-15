import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommitteeDecisionList from "./CommitteeDecisionList";
import * as committeeApi from "@/lib/api/committee/committeeApi";
import { retryWithBackoff } from "@/lib/api/core/retryMechanism";

// Mock dependencies
jest.mock("@/lib/api/committee/committeeApi");
jest.mock("@/lib/api/core/retryMechanism");
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("CommitteeDecisionList", () => {
  const mockDecisions = [
    {
      id: "1",
      submissionId: "sub-123",
      decision: "approved",
      decidedAt: "2023-06-15T14:45:00Z",
      decidedBy: "John Doe",
    },
    {
      id: "2",
      submissionId: "sub-456",
      decision: "rejected",
      decidedAt: "2023-06-16T10:30:00Z",
      decidedBy: "Jane Smith",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (committeeApi.getDecisions as jest.Mock).mockResolvedValue({
      data: mockDecisions,
    });
    (retryWithBackoff as jest.Mock).mockImplementation((fn) => fn());
  });

  it("renders loading state initially", () => {
    render(<CommitteeDecisionList committeeId="com-001" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders decisions after loading", async () => {
    render(<CommitteeDecisionList committeeId="com-001" />);

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    expect(screen.getByText("sub-123")).toBeInTheDocument();
    expect(screen.getByText("sub-456")).toBeInTheDocument();
    expect(
      screen.getByText("committee.decisionStatus.approved"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("committee.decisionStatus.rejected"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no decisions are found", async () => {
    (committeeApi.getDecisions as jest.Mock).mockResolvedValue({
      data: [],
    });

    render(<CommitteeDecisionList committeeId="com-001" />);

    await waitFor(() => {
      expect(
        screen.getByText("committee.noDecisionsFound"),
      ).toBeInTheDocument();
    });
  });

  it("shows error state when API call fails", async () => {
    (retryWithBackoff as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<CommitteeDecisionList committeeId="com-001" />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load committee decisions"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /retry/i }),
      ).toBeInTheDocument();
    });
  });

  it("retries fetching data when retry button is clicked", async () => {
    (retryWithBackoff as jest.Mock).mockRejectedValueOnce(
      new Error("API Error"),
    );

    render(<CommitteeDecisionList committeeId="com-001" />);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load committee decisions"),
      ).toBeInTheDocument();
    });

    // Reset mock to succeed on retry
    (retryWithBackoff as jest.Mock).mockImplementation((fn) => fn());

    // Click retry button
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText("sub-123")).toBeInTheDocument();
    });
  });

  it("refreshes data when refresh button is clicked", async () => {
    render(<CommitteeDecisionList committeeId="com-001" />);

    await waitFor(() => {
      expect(screen.getByText("sub-123")).toBeInTheDocument();
    });

    // Clear previous calls
    (committeeApi.getDecisions as jest.Mock).mockClear();

    // Click refresh button
    fireEvent.click(screen.getByRole("button", { name: /refresh decisions/i }));

    await waitFor(() => {
      expect(committeeApi.getDecisions).toHaveBeenCalledTimes(1);
    });
  });
});
