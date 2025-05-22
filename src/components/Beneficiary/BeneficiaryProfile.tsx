import React from "react";

export default function BeneficiaryProfile({
  beneficiaryId,
}: {
  beneficiaryId: string;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          <span className="text-xl">👤</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">Abdullah Al Mansoori</h2>
          <p className="text-gray-600">ID: {beneficiaryId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-medium mb-2">Personal Information</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Age:</span> 72
            </p>
            <p>
              <span className="font-medium">Gender:</span> Male
            </p>
            <p>
              <span className="font-medium">Nationality:</span> UAE
            </p>
            <p>
              <span className="font-medium">Phone:</span> +971 50 123 4567
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Assessment Status</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Client Type:</span> FDF
            </p>
              <p>
              <span className="font-medium">Cohort:</span> 1
            </p>
            <p>
              <span className="font-medium">Assessment Date:</span> October 10,
              2023
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className="text-green-600 font-medium">Approved</span>
            </p>
            <p>
              <span className="font-medium">Project:</span> Bathroom
              Modification
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Notes</h3>
        <p className="text-sm text-gray-600">
          Beneficiary requires bathroom modifications to improve accessibility.
          Mobility is limited and uses a wheelchair.
        </p>
      </div>
    </div>
  );
}
