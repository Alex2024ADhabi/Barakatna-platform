import React from "react";
import { ClientType } from "../../lib/forms/types";

interface FormParameterTrackerDemoProps {
  clientType?: ClientType;
}

const FormParameterTrackerDemo: React.FC<FormParameterTrackerDemoProps> = ({
  clientType = ClientType.FDF,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Form Parameter Tracker</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Client Type
        </label>
        <select
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={clientType}
        >
          {Object.values(ClientType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium mb-2">Parameter Mapping</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500 mb-2">
            No parameter mappings defined yet.
          </p>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add Parameter Mapping
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormParameterTrackerDemo;
