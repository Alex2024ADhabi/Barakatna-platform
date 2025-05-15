import React, { useState } from "react";

interface PriceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  currency: string;
}

const SimplePriceList = () => {
  const [items] = useState<PriceItem[]>([
    {
      id: "P001",
      category: "Bathroom",
      name: "Grab Bar Installation",
      description: "Standard stainless steel grab bar",
      unit: "Each",
      price: 150,
      currency: "AED",
    },
    {
      id: "P002",
      category: "Bathroom",
      name: "Non-Slip Flooring",
      description: "Per square meter of non-slip tile installation",
      unit: "m²",
      price: 200,
      currency: "AED",
    },
    {
      id: "P003",
      category: "Kitchen",
      name: "Lowered Countertop",
      description: "Modification of existing countertop",
      unit: "Linear meter",
      price: 500,
      currency: "AED",
    },
  ]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Price List Management</h2>
        <p className="text-gray-600">
          Manage modification items and their prices
        </p>
      </div>

      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search items..."
          className="border rounded px-3 py-2 w-64"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
          <span className="mr-2">+</span> Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-left">Unit</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{item.id}</td>
                <td className="py-2 px-4">{item.category}</td>
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4">{item.unit}</td>
                <td className="py-2 px-4">
                  {item.price} {item.currency}
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">
                    Edit
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimplePriceList;
