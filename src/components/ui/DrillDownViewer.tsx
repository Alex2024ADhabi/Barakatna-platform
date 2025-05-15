import React, { useState } from "react";
import { Button } from "./button";
import { ChevronLeft } from "lucide-react";

export interface DrillDownNode {
  id: string;
  name: string;
  data?: any;
  children?: DrillDownNode[];
}

export interface DrillDownViewerProps {
  rootNode: DrillDownNode;
  renderContent: (
    node: DrillDownNode,
    drillDown: (id: string) => void,
  ) => React.ReactNode;
  className?: string;
}

export function DrillDownViewer({
  rootNode,
  renderContent,
  className = "",
}: DrillDownViewerProps) {
  const [path, setPath] = useState<DrillDownNode[]>([rootNode]);
  const currentNode = path[path.length - 1];

  // Navigate to a child node
  const drillDown = (id: string) => {
    const findNode = (
      node: DrillDownNode,
      targetId: string,
    ): DrillDownNode | null => {
      if (node.id === targetId) return node;
      if (!node.children) return null;

      for (const child of node.children) {
        const found = findNode(child, targetId);
        if (found) return found;
      }

      return null;
    };

    const targetNode = findNode(rootNode, id);
    if (targetNode) {
      setPath([...path, targetNode]);
    }
  };

  // Navigate back to parent
  const navigateUp = () => {
    if (path.length > 1) {
      setPath(path.slice(0, -1));
    }
  };

  // Navigate to specific level in path
  const navigateToLevel = (index: number) => {
    if (index >= 0 && index < path.length) {
      setPath(path.slice(0, index + 1));
    }
  };

  return (
    <div className={className}>
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-1 mb-4 overflow-x-auto pb-2">
        {path.map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && <span className="text-gray-400 mx-1">/</span>}
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm ${index === path.length - 1 ? "font-medium" : ""}`}
              onClick={() => navigateToLevel(index)}
            >
              {node.name}
            </Button>
          </React.Fragment>
        ))}
      </div>

      {/* Back button if not at root */}
      {path.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={navigateUp}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {path[path.length - 2].name}
        </Button>
      )}

      {/* Current node content */}
      <div className="border rounded-md">
        {renderContent(currentNode, drillDown)}
      </div>
    </div>
  );
}
