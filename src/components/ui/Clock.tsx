/**
 * Clock Component
 *
 * A simple clock icon component for use in the ConflictResolutionDialog
 */

import React from "react";

interface ClockProps {
  className?: string;
}

export const Clock: React.FC<ClockProps> = ({ className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

export default Clock;
