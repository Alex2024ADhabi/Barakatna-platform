import React, { useState, useCallback } from "react";

interface Node {
  id: string;
  name: string;
  data?: any;
  children?: Node[];
}

interface DrillDownViewerProps {
  rootNode: Node;
  renderContent: (
    node: Node,
    drillDown: (nodeId: string) => void,
  ) => React.ReactNode;
  className?: string;
}

export const DrillDownViewer: React.FC<DrillDownViewerProps> = ({
  rootNode,
  renderContent,
  className = "",
}) => {
  const [currentNodeId, setCurrentNodeId] = useState(rootNode.id);
  const [breadcrumbs, setBreadcrumbs] = useState<Node[]>([rootNode]);

  const findNode = useCallback((nodeId: string, node: Node): Node | null => {
    if (node.id === nodeId) return node;
    if (!node.children) return null;

    for (const child of node.children) {
      const found = findNode(nodeId, child);
      if (found) return found;
    }

    return null;
  }, []);

  const currentNode = findNode(currentNodeId, rootNode) || rootNode;

  const drillDown = useCallback(
    (nodeId: string) => {
      const node = findNode(nodeId, rootNode);
      if (node) {
        setCurrentNodeId(nodeId);
        setBreadcrumbs((prev) => [...prev, node]);
      }
    },
    [findNode, rootNode],
  );

  const navigateTo = useCallback(
    (index: number) => {
      if (index < breadcrumbs.length) {
        setCurrentNodeId(breadcrumbs[index].id);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    },
    [breadcrumbs],
  );

  return (
    <div className={`drill-down-viewer bg-white rounded-md ${className}`}>
      <div className="p-4 border-b">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.id} className="inline-flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                <button
                  onClick={() => navigateTo(index)}
                  className={`inline-flex items-center text-sm font-medium ${index === breadcrumbs.length - 1 ? "text-blue-600" : "text-gray-700 hover:text-blue-600"}`}
                >
                  {crumb.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="drill-down-content p-4">
        {renderContent(currentNode, drillDown)}
      </div>
    </div>
  );
};
