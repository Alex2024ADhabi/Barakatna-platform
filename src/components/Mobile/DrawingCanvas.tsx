import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Pencil, Eraser, Save, Trash2, Undo, Download } from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface DrawingCanvasProps {
  assessmentId: string;
  roomId?: string;
  onSave?: (drawingData: { dataUrl: string; caption: string }) => void;
  initialDrawing?: string;
  initialCaption?: string;
}

export default function DrawingCanvas({
  assessmentId,
  roomId,
  onSave,
  initialDrawing,
  initialCaption = "",
}: DrawingCanvasProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [saving, setSaving] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [history, setHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to match its display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Scale context to account for device pixel ratio
    context.scale(dpr, dpr);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;

    contextRef.current = context;

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, rect.width, rect.height);
        saveToHistory();
      };
      img.src = initialDrawing;
    } else {
      // Start with a blank canvas in history
      saveToHistory();
    }

    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [initialDrawing]);

  // Update context when tool or color changes
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    contextRef.current.lineWidth =
      tool === "eraser" ? lineWidth * 2 : lineWidth;
  }, [tool, color, lineWidth]);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setIsDrawing(true);
    context.beginPath();

    // Get coordinates
    let clientX, clientY;
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    // Prevent scrolling when drawing on touch devices
    if ("touches" in e) {
      e.preventDefault();
    }

    // Get coordinates
    let clientX, clientY;
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;

    contextRef.current.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const saveToHistory = () => {
    if (!canvasRef.current) return;

    // If we're not at the end of the history, remove everything after current step
    if (currentStep < history.length - 1) {
      setHistory(history.slice(0, currentStep + 1));
    }

    const newDataUrl = canvasRef.current.toDataURL("image/png");
    setHistory([...history.slice(0, currentStep + 1), newDataUrl]);
    setCurrentStep(currentStep + 1);

    // Save to local storage
    try {
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_drawing`,
        newDataUrl,
      );
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_drawing_caption`,
        caption,
      );
    } catch (err) {
      console.error("Failed to store drawing data locally", err);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const undo = () => {
    if (currentStep <= 0) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setCurrentStep(currentStep - 1);
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img,
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio,
      );
    };
    img.src = history[currentStep - 1];
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;

    setSaving(true);
    const dataUrl = canvasRef.current.toDataURL("image/png");

    if (onSave) {
      onSave({ dataUrl, caption });
    }

    setSaving(false);
  };

  const downloadDrawing = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `drawing-${assessmentId}-${roomId || ""}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Pencil className="mr-2" /> Drawing Canvas
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs">
              {networkStatus ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2">
            <Button
              variant={tool === "pencil" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("pencil")}
              className="flex items-center"
            >
              <Pencil size={16} className="mr-1" /> Draw
            </Button>
            <Button
              variant={tool === "eraser" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("eraser")}
              className="flex items-center"
            >
              <Eraser size={16} className="mr-1" /> Erase
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={currentStep <= 0}
              className="flex items-center"
            >
              <Undo size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              className="flex items-center"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 mb-2">
          <div>
            <label
              htmlFor="color-picker"
              className="text-xs font-medium block mb-1"
            >
              Color
            </label>
            <input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="line-width"
              className="text-xs font-medium block mb-1"
            >
              Line Width
            </label>
            <input
              id="line-width"
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="border rounded-md overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            width="400"
            height="300"
            className="w-full h-64 bg-white touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="drawing-caption" className="text-sm font-medium">
            Caption
          </label>
          <Input
            id="drawing-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter a caption for this drawing"
            className="w-full"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={downloadDrawing}
          className="flex items-center"
        >
          <Download size={16} className="mr-1" /> Download
        </Button>

        <Button onClick={saveDrawing} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-1" /> Save Drawing
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
