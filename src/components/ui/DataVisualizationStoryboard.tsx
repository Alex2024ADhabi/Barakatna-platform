import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
import { PieChart } from "./PieChart";
import { GanttChart } from "./GanttChart";
import { HeatMap } from "./HeatMap";
import { DataFilterPanel } from "./DataFilterPanel";
import { DrillDownViewer } from "./DrillDownViewer";
import { ComparisonTool } from "./ComparisonTool";
import { TimelineExplorer } from "./TimelineExplorer";
import { GeospatialViewer } from "./GeospatialViewer";

// Sample data for charts
const barChartData = [
  { month: "Jan", sales: 65, profit: 15, customers: 120 },
  { month: "Feb", sales: 59, profit: 12, customers: 110 },
  { month: "Mar", sales: 80, profit: 18, customers: 145 },
  { month: "Apr", sales: 81, profit: 19, customers: 160 },
  { month: "May", sales: 56, profit: 10, customers: 90 },
  { month: "Jun", sales: 55, profit: 11, customers: 100 },
  { month: "Jul", sales: 40, profit: 8, customers: 85 },
];

const lineChartData = [
  { date: "2023-01-01", temperature: 5, humidity: 40, pressure: 1012 },
  { date: "2023-02-01", temperature: 7, humidity: 45, pressure: 1010 },
  { date: "2023-03-01", temperature: 10, humidity: 50, pressure: 1008 },
  { date: "2023-04-01", temperature: 15, humidity: 55, pressure: 1007 },
  { date: "2023-05-01", temperature: 20, humidity: 60, pressure: 1006 },
  { date: "2023-06-01", temperature: 25, humidity: 65, pressure: 1005 },
  { date: "2023-07-01", temperature: 28, humidity: 70, pressure: 1004 },
];

const pieChartData = [
  { name: "Desktop", value: 400, color: "#4f46e5" },
  { name: "Mobile", value: 300, color: "#10b981" },
  { name: "Tablet", value: 200, color: "#f59e0b" },
  { name: "Other", value: 100, color: "#ef4444" },
];

const ganttChartData = [
  {
    id: "1",
    name: "Research",
    start: new Date(2023, 0, 1).getTime(),
    end: new Date(2023, 0, 15).getTime(),
    color: "#4f46e5",
    progress: 100,
  },
  {
    id: "2",
    name: "Design",
    start: new Date(2023, 0, 10).getTime(),
    end: new Date(2023, 1, 5).getTime(),
    color: "#10b981",
    progress: 80,
  },
  {
    id: "3",
    name: "Development",
    start: new Date(2023, 1, 1).getTime(),
    end: new Date(2023, 2, 15).getTime(),
    color: "#f59e0b",
    progress: 50,
  },
  {
    id: "4",
    name: "Testing",
    start: new Date(2023, 2, 10).getTime(),
    end: new Date(2023, 3, 5).getTime(),
    color: "#ef4444",
    progress: 20,
  },
];

const heatMapData = [
  { x: "Mon", y: "Morning", value: 10 },
  { x: "Mon", y: "Afternoon", value: 15 },
  { x: "Mon", y: "Evening", value: 25 },
  { x: "Tue", y: "Morning", value: 12 },
  { x: "Tue", y: "Afternoon", value: 18 },
  { x: "Tue", y: "Evening", value: 22 },
  { x: "Wed", y: "Morning", value: 8 },
  { x: "Wed", y: "Afternoon", value: 20 },
  { x: "Wed", y: "Evening", value: 28 },
  { x: "Thu", y: "Morning", value: 15 },
  { x: "Thu", y: "Afternoon", value: 25 },
  { x: "Thu", y: "Evening", value: 30 },
  { x: "Fri", y: "Morning", value: 20 },
  { x: "Fri", y: "Afternoon", value: 30 },
  { x: "Fri", y: "Evening", value: 35 },
];

// Sample data for interactive tools
const filterOptions = [
  {
    field: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "clothing", label: "Clothing" },
      { value: "furniture", label: "Furniture" },
    ],
  },
  {
    field: "price",
    label: "Price Range",
    type: "range",
    defaultValue: { min: 0, max: 1000 },
  },
  {
    field: "date",
    label: "Date",
    type: "date",
  },
];

const drillDownData = {
  id: "root",
  name: "All Products",
  children: [
    {
      id: "electronics",
      name: "Electronics",
      children: [
        {
          id: "laptops",
          name: "Laptops",
          data: { count: 120, revenue: "$240,000" },
        },
        {
          id: "phones",
          name: "Phones",
          data: { count: 200, revenue: "$180,000" },
        },
      ],
    },
    {
      id: "clothing",
      name: "Clothing",
      children: [
        {
          id: "mens",
          name: "Men's Clothing",
          data: { count: 150, revenue: "$75,000" },
        },
        {
          id: "womens",
          name: "Women's Clothing",
          data: { count: 250, revenue: "$125,000" },
        },
      ],
    },
  ],
};

const comparisonItems = [
  {
    id: "product1",
    name: "Product A",
    data: {
      price: 499,
      rating: 4.5,
      stock: 120,
      features: ["Feature 1", "Feature 2", "Feature 3"],
    },
  },
  {
    id: "product2",
    name: "Product B",
    data: {
      price: 599,
      rating: 4.2,
      stock: 85,
      features: ["Feature 1", "Feature 3", "Feature 4"],
    },
  },
  {
    id: "product3",
    name: "Product C",
    data: {
      price: 399,
      rating: 4.8,
      stock: 200,
      features: ["Feature 2", "Feature 3", "Feature 5"],
    },
  },
];

const comparisonConfig = {
  fields: [
    { key: "price", label: "Price ($)" },
    { key: "rating", label: "Rating" },
    { key: "stock", label: "Stock" },
    {
      key: "features",
      label: "Features",
      render: (features: string[]) => (
        <ul className="list-disc pl-5">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      ),
    },
  ],
};

const timelineData = [
  { date: "2023-01-01", sales: 100, visitors: 1000 },
  { date: "2023-02-01", sales: 120, visitors: 1200 },
  { date: "2023-03-01", sales: 140, visitors: 1400 },
  { date: "2023-04-01", sales: 160, visitors: 1600 },
  { date: "2023-05-01", sales: 180, visitors: 1800 },
  { date: "2023-06-01", sales: 200, visitors: 2000 },
];

const timelineEvents = [
  {
    id: "event1",
    title: "Product Launch",
    description: "New product line launched",
    date: "2023-02-15",
    color: "#4f46e5",
  },
  {
    id: "event2",
    title: "Marketing Campaign",
    description: "Major marketing campaign started",
    date: "2023-04-10",
    color: "#10b981",
  },
];

const geoLocations = [
  {
    id: "loc1",
    name: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    category: "office",
    data: { employees: 120, revenue: "$2.5M" },
  },
  {
    id: "loc2",
    name: "San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
    category: "office",
    data: { employees: 85, revenue: "$1.8M" },
  },
  {
    id: "loc3",
    name: "Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    category: "warehouse",
    data: { capacity: "15,000 sq ft", inventory: "$5.2M" },
  },
];

const geoCategories = [
  { id: "office", name: "Offices", color: "#4f46e5" },
  { id: "warehouse", name: "Warehouses", color: "#10b981" },
];

export default function DataVisualizationStoryboard() {
  return (
    <div className="bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Data Visualization Components</h1>

      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="tools">Interactive Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChart
              title="Monthly Sales Performance"
              data={barChartData}
              xAxisKey="month"
              bars={[
                { dataKey: "sales", name: "Sales", color: "#4f46e5" },
                { dataKey: "profit", name: "Profit", color: "#10b981" },
              ]}
            />

            <LineChart
              title="Weather Trends"
              data={lineChartData}
              xAxisKey="date"
              lines={[
                {
                  dataKey: "temperature",
                  name: "Temperature (°C)",
                  color: "#ef4444",
                },
                { dataKey: "humidity", name: "Humidity (%)", color: "#3b82f6" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChart
              title="Device Distribution"
              data={pieChartData}
              height={350}
            />

            <HeatMap
              title="Weekly Activity Heatmap"
              data={heatMapData}
              height={350}
            />
          </div>

          <GanttChart
            title="Project Timeline"
            tasks={ganttChartData}
            height={300}
          />
        </TabsContent>

        <TabsContent value="tools" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataFilterPanel
              title="Filter Products"
              filterOptions={filterOptions}
              onFilterChange={(filters) =>
                console.log("Filters applied:", filters)
              }
            />

            <ComparisonTool
              title="Product Comparison"
              items={comparisonItems}
              config={comparisonConfig}
              defaultSelectedIds={["product1", "product2"]}
            />
          </div>

          <DrillDownViewer
            title="Product Categories"
            rootNode={drillDownData}
            renderContent={(node, drillDown) => (
              <div>
                {node.children ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {node.children.map((child) => (
                      <Card
                        key={child.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => drillDown(child.id)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-medium">{child.name}</h3>
                          {child.data && (
                            <div className="mt-2 text-sm text-gray-500">
                              {Object.entries(child.data).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    {key}: {value}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded">
                    <h3 className="font-medium">{node.name} Details</h3>
                    {node.data && (
                      <div className="mt-4">
                        {Object.entries(node.data).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b"
                          >
                            <span className="font-medium">{key}</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          />

          <TimelineExplorer
            title="Sales Performance Over Time"
            data={timelineData}
            events={timelineEvents}
            dateKey="date"
            series={[
              { id: "sales", name: "Sales", color: "#4f46e5" },
              { id: "visitors", name: "Visitors", color: "#10b981" },
            ]}
            height={350}
          />

          <Card>
            <CardHeader>
              <CardTitle>Geospatial Viewer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border rounded bg-gray-50">
                <p>
                  GeospatialViewer requires leaflet and react-leaflet packages.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Install with: npm install leaflet react-leaflet @types/leaflet
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
