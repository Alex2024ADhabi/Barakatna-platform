import React from "react";
import { useTranslation } from "react-i18next";
import CommitteeDecisionList from "./CommitteeDecisionList";

export default function CommitteeStoryboard() {
  // Mock committee data
  const committees = [
    {
      id: "com-001",
      name: "Home Modifications Committee",
      description: "Reviews and approves home modification assessments",
      type: "assessment",
      clientTypeId: 1,
      members: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "com-002",
      name: "Budget Approval Committee",
      description: "Reviews and approves budget requests",
      type: "budget",
      clientTypeId: 1,
      members: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "com-003",
      name: "Quality Assurance Committee",
      description: "Reviews project quality and compliance",
      type: "quality",
      clientTypeId: 2,
      members: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Committee Decision Management</h1>
      <CommitteeDecisionList committeeId="com-001" />
    </div>
  );
}
