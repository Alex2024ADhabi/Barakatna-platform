import React from "react";

export function CommitteeDecisionList({
  committeeId,
}: {
  committeeId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium">Decision #D-{committeeId}-001</h3>
        <p className="text-sm text-gray-600">
          Approved bathroom modification for beneficiary #B-001
        </p>
        <div className="mt-2 text-xs text-gray-500">October 15, 2023</div>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-medium">Decision #D-{committeeId}-002</h3>
        <p className="text-sm text-gray-600">
          Requested additional assessment for beneficiary #B-003
        </p>
        <div className="mt-2 text-xs text-gray-500">October 18, 2023</div>
      </div>
    </div>
  );
}

export function SubmissionReviewForm({
  submissionId,
}: {
  submissionId: string;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Review Submission #{submissionId}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Bathroom modification request for elderly beneficiary
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Decision</label>
          <select className="w-full p-2 border rounded">
            <option>Approve</option>
            <option>Reject</option>
            <option>Request More Information</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <textarea className="w-full p-2 border rounded" rows={3}></textarea>
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Submit Review
        </button>
      </div>
    </div>
  );
}
