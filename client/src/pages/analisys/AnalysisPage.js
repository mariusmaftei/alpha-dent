import React, { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { analyzeImage } from "../../services/api";
import {
  faMagnifyingGlass,
  faSearchPlus,
  faCircle,
  faCropSimple,
  faRotateLeft,
  faRuler,
  faAngleRight,
  faShapes,
  faPen,
  faSquare,
  faCircle as faCircleIcon,
  faArrowRight,
  faFont,
  faEraser,
  faSun,
  faAdjust,
  faMagic,
  faPalette,
  faSearch,
  faHand,
  faExpand,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import FocusTool from "../../components/analysis/FocusTool/FocusTool";
import Legend from "../../components/UI/Legend";
import Results from "../../components/UI/Results";
import ToolMenu from "../../components/UI/ToolMenu";
import AnalyzingOverlay from "../../components/UI/AnalyzingOverlay";
import ToastContainer from "../../components/UI/ToastContainer";
import styles from "./AnalisysPage.module.css";

const legendItems = [
  { id: "0", label: "Abrasion", color: "#6b7280", icon: <FaTooth /> },
  { id: "1", label: "Filling", color: "#f6c344", icon: <FaTooth /> },
  { id: "2", label: "Crown", color: "#8b5cf6", icon: <FaTooth /> },
  { id: "3", label: "Caries Class 1", color: "#7f1d1d", icon: <FaTooth /> },
  { id: "4", label: "Caries Class 2", color: "#b91c1c", icon: <FaTooth /> },
  { id: "5", label: "Caries Class 3", color: "#dc2626", icon: <FaTooth /> },
  { id: "6", label: "Caries Class 4", color: "#ef4444", icon: <FaTooth /> },
  { id: "7", label: "Caries Class 5", color: "#f87171", icon: <FaTooth /> },
  { id: "8", label: "Caries Class 6", color: "#fecdd3", icon: <FaTooth /> },
];

const initialDetections = [
  {
    id: "d1",
    classId: "3",
    label: "Caries Class 1",
    color: "#7f1d1d",
    conf: 0.89,
    box: { x: 18, y: 24, w: 22, h: 18 },
  },
  {
    id: "d2",
    classId: "4",
    label: "Caries Class 2",
    color: "#b91c1c",
    conf: 0.78,
    box: { x: 48, y: 38, w: 26, h: 20 },
  },
  {
    id: "d3",
    classId: "1",
    label: "Filling",
    color: "#f6c344",
    conf: 0.66,
    box: { x: 34, y: 58, w: 18, h: 14 },
  },
  {
    id: "d4",
    classId: "5",
    label: "Caries Class 3",
    color: "#dc2626",
    conf: 0.92,
    box: { x: 12, y: 45, w: 20, h: 16 },
  },
  {
    id: "d5",
    classId: "6",
    label: "Caries Class 4",
    color: "#ef4444",
    conf: 0.85,
    box: { x: 65, y: 15, w: 24, h: 19 },
  },
  {
    id: "d6",
    classId: "2",
    label: "Crown",
    color: "#8b5cf6",
    conf: 0.94,
    box: { x: 25, y: 12, w: 28, h: 22 },
  },
  {
    id: "d7",
    classId: "7",
    label: "Caries Class 5",
    color: "#f87171",
    conf: 0.71,
    box: { x: 55, y: 52, w: 19, h: 15 },
  },
  {
    id: "d8",
    classId: "0",
    label: "Abrasion",
    color: "#6b7280",
    conf: 0.68,
    box: { x: 72, y: 28, w: 16, h: 12 },
  },
  {
    id: "d9",
    classId: "8",
    label: "Caries Class 6",
    color: "#fecdd3",
    conf: 0.58,
    box: { x: 8, y: 65, w: 15, h: 11 },
  },
  {
    id: "d10",
    classId: "3",
    label: "Caries Class 1",
    color: "#7f1d1d",
    conf: 0.81,
    box: { x: 38, y: 72, w: 21, h: 17 },
  },
];

function AnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const image = state?.image;
  const name = state?.name;
  const initialPredictions = state?.predictions;
  const focusToolRef = useRef(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("legend"); // legend | results
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [lensSize, setLensSize] = useState(160);
  const [lensZoom, setLensZoom] = useState(2);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [detections, setDetections] = useState(() => {
    if (initialPredictions && Array.isArray(initialPredictions)) {
      return initialPredictions.map((pred, index) => {
        let polygon = null;
        if (pred.polygon && Array.isArray(pred.polygon)) {
          if (pred.polygon.length > 0 && typeof pred.polygon[0] === 'number') {
            const coords = pred.polygon;
            polygon = [];
            for (let i = 0; i < coords.length; i += 2) {
              polygon.push({
                x: coords[i] * 100,
                y: coords[i + 1] * 100,
              });
            }
          } else {
            polygon = pred.polygon.map(p => ({
              x: (typeof p === 'number' ? p : p.x) * 100,
              y: (typeof p === 'number' ? p : p.y) * 100,
            }));
          }
        }
        
        const bbox = pred.bbox || pred.box || { x: 0, y: 0, w: 0.1, h: 0.1 };
        const normalizedBbox = {
          x: (typeof bbox.x === 'number' && bbox.x <= 1) ? bbox.x * 100 : bbox.x,
          y: (typeof bbox.y === 'number' && bbox.y <= 1) ? bbox.y * 100 : bbox.y,
          w: (typeof bbox.w === 'number' && bbox.w <= 1) ? bbox.w * 100 : bbox.w,
          h: (typeof bbox.h === 'number' && bbox.h <= 1) ? bbox.h * 100 : bbox.h,
        };
        
        const normalizedBboxOriginal = {
          x: (typeof bbox.x === 'number' && bbox.x <= 1) ? bbox.x : bbox.x / 100,
          y: (typeof bbox.y === 'number' && bbox.y <= 1) ? bbox.y : bbox.y / 100,
          w: (typeof bbox.w === 'number' && bbox.w <= 1) ? bbox.w : bbox.w / 100,
          h: (typeof bbox.h === 'number' && bbox.h <= 1) ? bbox.h : bbox.h / 100,
        };
        
        return {
          id: `d${index + 1}`,
          classId: pred.class_id.toString(),
          label: pred.class_name || `Class ${pred.class_id}`,
          color: legendItems.find(item => item.id === pred.class_id.toString())?.color || "#6b7280",
          conf: pred.confidence,
          box: normalizedBbox,
          boxNormalized: normalizedBboxOriginal,
          polygon: polygon,
        };
      });
    }
    return initialDetections.map(d => ({
      ...d,
      boxNormalized: {
        x: d.box.x / 100,
        y: d.box.y / 100,
        w: d.box.w / 100,
        h: d.box.h / 100,
      }
    }));
  });
  const [hiddenBoxIds, setHiddenBoxIds] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      img.src = image;
    }
  }, [image]);
  
  const resultsItems = useMemo(
    () =>
      detections.map((d) => {
        const pixelWidth = imageDimensions.width > 0 
          ? Math.round((d.boxNormalized?.w || d.box.w / 100) * imageDimensions.width)
          : Math.round(d.box.w);
        const pixelHeight = imageDimensions.height > 0
          ? Math.round((d.boxNormalized?.h || d.box.h / 100) * imageDimensions.height)
          : Math.round(d.box.h);
        
        return {
          id: d.id,
          label: d.label,
          color: d.color,
          meta: `${(d.conf * 100).toFixed(0)}%`,
          description: `Confidence ${(d.conf * 100).toFixed(0)}%. Region ${pixelWidth}×${pixelHeight} px.`,
          score: d.conf,
          hidden: hiddenBoxIds.includes(d.id),
        };
      }),
    [detections, hiddenBoxIds, imageDimensions]
  );

  const toggleBoxVisibility = (id) => {
    setHiddenBoxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const showAllBoxes = () => {
    setHiddenBoxIds([]);
  };

  const hideAllBoxes = () => {
    setHiddenBoxIds(detections.map((d) => d.id));
  };

  const showToast = (message, type = "error", duration = 5000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const exportToCSV = () => {
    try {
      const patientId = name ? name.replace(/\.[^/.]+$/, "") : "test_image";
      const csvRows = ["patient_id,class_id,confidence,poly"];
      
      detections.forEach((detection) => {
        const classId = detection.classId;
        const confidence = detection.conf.toFixed(6);
        let poly;
        
        if (detection.polygon && Array.isArray(detection.polygon) && detection.polygon.length > 0) {
          poly = detection.polygon.map(p => {
            const x = (typeof p === 'object' ? p.x : p) / 100;
            const y = (typeof p === 'object' ? p.y : p) / 100;
            return `${x.toFixed(6)} ${y.toFixed(6)}`;
          }).join(" ");
        } else {
          const box = detection.box;
          const x1 = box.x / 100;
          const y1 = box.y / 100;
          const x2 = (box.x + box.w) / 100;
          const y2 = box.y / 100;
          const x3 = (box.x + box.w) / 100;
          const y3 = (box.y + box.h) / 100;
          const x4 = box.x / 100;
          const y4 = (box.y + box.h) / 100;
          poly = `${x1.toFixed(6)} ${y1.toFixed(6)} ${x2.toFixed(6)} ${y2.toFixed(6)} ${x3.toFixed(6)} ${y3.toFixed(6)} ${x4.toFixed(6)} ${y4.toFixed(6)}`;
        }
        csvRows.push(`${patientId},${classId},${confidence},"${poly}"`);
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${patientId}_results.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast("CSV exported successfully!", "success", 3000);
    } catch (error) {
      showToast("Failed to export CSV: " + error.message, "error");
    }
  };

  const handleAnalyzeImage = async (imageFile) => {
    if (!imageFile) {
      showToast("Please select an image file", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await analyzeImage(imageFile);
      
      if (data.predictions && Array.isArray(data.predictions)) {
        const formattedDetections = data.predictions.map((pred, index) => {
          let polygon = null;
          if (pred.polygon && Array.isArray(pred.polygon)) {
            if (pred.polygon.length > 0 && typeof pred.polygon[0] === 'number') {
              const coords = pred.polygon;
              polygon = [];
              for (let i = 0; i < coords.length; i += 2) {
                polygon.push({
                  x: coords[i] * 100,
                  y: coords[i + 1] * 100,
                });
              }
            } else {
              polygon = pred.polygon.map(p => ({
                x: (typeof p === 'number' ? p : p.x) * 100,
                y: (typeof p === 'number' ? p : p.y) * 100,
              }));
            }
          }
          
          const bbox = pred.bbox || pred.box || { x: 0, y: 0, w: 0.1, h: 0.1 };
          const normalizedBbox = {
            x: (typeof bbox.x === 'number' && bbox.x <= 1) ? bbox.x * 100 : bbox.x,
            y: (typeof bbox.y === 'number' && bbox.y <= 1) ? bbox.y * 100 : bbox.y,
            w: (typeof bbox.w === 'number' && bbox.w <= 1) ? bbox.w * 100 : bbox.w,
            h: (typeof bbox.h === 'number' && bbox.h <= 1) ? bbox.h * 100 : bbox.h,
          };
          
          const normalizedBboxOriginal = {
            x: (typeof bbox.x === 'number' && bbox.x <= 1) ? bbox.x : bbox.x / 100,
            y: (typeof bbox.y === 'number' && bbox.y <= 1) ? bbox.y : bbox.y / 100,
            w: (typeof bbox.w === 'number' && bbox.w <= 1) ? bbox.w : bbox.w / 100,
            h: (typeof bbox.h === 'number' && bbox.h <= 1) ? bbox.h : bbox.h / 100,
          };
          
          return {
            id: `d${index + 1}`,
            classId: pred.class_id.toString(),
            label: pred.class_name || `Class ${pred.class_id}`,
            color: legendItems.find(item => item.id === pred.class_id.toString())?.color || "#6b7280",
            conf: pred.confidence,
            box: normalizedBbox,
            boxNormalized: normalizedBboxOriginal,
            polygon: polygon,
          };
        });
        
        setDetections(formattedDetections);
        setHiddenBoxIds([]);
        showToast(`Analysis complete! Found ${formattedDetections.length} detections.`, "success");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      if (error.message.includes("connect") || error.message.includes("server")) {
        showToast("Unable to connect to analysis server. Using demo data.", "warning", 6000);
      } else {
        showToast(error.message || "Analysis failed. Please try again.", "error");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visibleDetections = useMemo(
    () => detections.filter((d) => !hiddenBoxIds.includes(d.id)),
    [detections, hiddenBoxIds]
  );

  const [selectMode, setSelectMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);

  // Measurement tools
  const [activeMeasurementTool, setActiveMeasurementTool] = useState("none");
  const [measurementColor, setMeasurementColor] = useState("#3b82f6"); // Blue

  // Annotation tools
  const [activeAnnotationTool, setActiveAnnotationTool] = useState("none");
  const [annotationColor, setAnnotationColor] = useState("#3b82f6"); // Blue
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState(2);

  // Navigation
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Image enhancement
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [colorFilter, setColorFilter] = useState("none");

  const handleLegend = () => {
    if (panelOpen && panelMode === "legend") {
      setPanelOpen(false);
    } else {
      setPanelMode("legend");
      setPanelOpen(true);
    }
  };

  const handleResults = () => {
    if (panelOpen && panelMode === "results") {
      setPanelOpen(false);
    } else {
      setPanelMode("results");
      setPanelOpen(true);
    }
  };

  return (
    <main className={styles.page}>
      {isAnalyzing && <AnalyzingOverlay label="Analyzing image..." />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.layout}>
        {panelMode === "legend" ? (
          <Legend collapsed={!panelOpen} items={legendItems} />
        ) : (
          <Results
            collapsed={!panelOpen}
            items={resultsItems}
            onToggleBox={toggleBoxVisibility}
            onShowAll={showAllBoxes}
            onHideAll={hideAllBoxes}
            onExport={exportToCSV}
            imageName={name}
          />
        )}

        <div className={styles.centerPane}>
          {image ? (
            <div className={styles.imageWrapper}>
              <FocusTool
                ref={focusToolRef}
                image={image}
                name={name}
                boxes={visibleDetections}
                showMagnifier={showMagnifier}
                lensSize={lensSize}
                lensZoom={lensZoom}
                selectMode={selectMode}
                cropRect={cropRect}
                onToggleBoxVisibility={toggleBoxVisibility}
                onCrop={(rect) => {
                  setCropRect(rect);
                  setSelectMode(false);
                }}
                activeMeasurementTool={activeMeasurementTool}
                measurementColor={measurementColor}
                activeAnnotationTool={activeAnnotationTool}
                annotationColor={annotationColor}
                annotationStrokeWidth={annotationStrokeWidth}
                zoom={zoom}
                onZoomChange={setZoom}
                panOffset={panOffset}
                onPanChange={setPanOffset}
                brightness={brightness}
                contrast={contrast}
                sharpness={sharpness}
                colorFilter={colorFilter}
              />
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No image provided. Please upload from the home page.</p>
              <button className={styles.primary} onClick={() => navigate("/")}>
                Go to upload
              </button>
            </div>
          )}
        </div>

        <ToolMenu
          title="Tools"
          onLegend={handleLegend}
          onResults={handleResults}
          onNewAnalysis={() => navigate("/")}
          resultsCount={resultsItems.length}
          categories={[
            {
              id: "measurement",
              label: "Measurement Tools",
              icon: <FontAwesomeIcon icon={faRuler} />,
              items: [
                {
                  id: "ruler",
                  label: "Ruler",
                  meta: "Measure distance between two points",
                  icon: <FontAwesomeIcon icon={faRuler} />,
                  isActive: activeMeasurementTool === "ruler",
                  onClick: () =>
                    setActiveMeasurementTool(
                      activeMeasurementTool === "ruler" ? "none" : "ruler"
                    ),
                },
                {
                  id: "angle",
                  label: "Angle",
                  meta: "Measure angles (3 clicks)",
                  icon: <FontAwesomeIcon icon={faAngleRight} />,
                  isActive: activeMeasurementTool === "angle",
                  onClick: () =>
                    setActiveMeasurementTool(
                      activeMeasurementTool === "angle" ? "none" : "angle"
                    ),
                },
                {
                  id: "area",
                  label: "Area",
                  meta: "Measure area by drawing a polygon",
                  icon: <FontAwesomeIcon icon={faShapes} />,
                  isActive: activeMeasurementTool === "area",
                  onClick: () =>
                    setActiveMeasurementTool(
                      activeMeasurementTool === "area" ? "none" : "area"
                    ),
                },
                {
                  id: "measurementColor",
                  label: "Color",
                  meta: `Current: ${
                    measurementColor === "#ef4444"
                      ? "Red"
                      : measurementColor === "#22c55e"
                      ? "Green"
                      : "Blue"
                  }`,
                  icon: <FontAwesomeIcon icon={faPalette} />,
                  onClick: () => {
                    const colors = ["#3b82f6", "#ef4444", "#22c55e"]; // Blue, Red, Green
                    const currentIndex = colors.indexOf(measurementColor);
                    setMeasurementColor(
                      colors[(currentIndex + 1) % colors.length]
                    );
                  },
                },
                {
                  id: "clearMeasurements",
                  label: "Clear Measurements",
                  meta: "Remove all measurements",
                  icon: <FontAwesomeIcon icon={faTrash} />,
                  onClick: () => {
                    focusToolRef.current?.clearMeasurements();
                  },
                  variant: "solid",
                },
              ],
            },
            {
              id: "annotation",
              label: "Annotation Tools",
              icon: <FontAwesomeIcon icon={faPen} />,
              items: [
                {
                  id: "draw",
                  label: "Draw",
                  meta: "Freehand drawing",
                  icon: <FontAwesomeIcon icon={faPen} />,
                  isActive: activeAnnotationTool === "draw",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "draw" ? "none" : "draw"
                    ),
                },
                {
                  id: "rectangle",
                  label: "Rectangle",
                  meta: "Draw rectangle",
                  icon: <FontAwesomeIcon icon={faSquare} />,
                  isActive: activeAnnotationTool === "rectangle",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "rectangle"
                        ? "none"
                        : "rectangle"
                    ),
                },
                {
                  id: "circle",
                  label: "Circle",
                  meta: "Draw circle",
                  icon: <FontAwesomeIcon icon={faCircleIcon} />,
                  isActive: activeAnnotationTool === "circle",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "circle" ? "none" : "circle"
                    ),
                },
                {
                  id: "arrow",
                  label: "Arrow",
                  meta: "Draw arrow",
                  icon: <FontAwesomeIcon icon={faArrowRight} />,
                  isActive: activeAnnotationTool === "arrow",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "arrow" ? "none" : "arrow"
                    ),
                },
                {
                  id: "text",
                  label: "Text",
                  meta: "Add text label",
                  icon: <FontAwesomeIcon icon={faFont} />,
                  isActive: activeAnnotationTool === "text",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "text" ? "none" : "text"
                    ),
                },
                {
                  id: "eraser",
                  label: "Eraser",
                  meta: "Remove annotations",
                  icon: <FontAwesomeIcon icon={faEraser} />,
                  isActive: activeAnnotationTool === "eraser",
                  onClick: () =>
                    setActiveAnnotationTool(
                      activeAnnotationTool === "eraser" ? "none" : "eraser"
                    ),
                },
                {
                  id: "annotationColor",
                  label: "Color",
                  meta: `Current: ${
                    annotationColor === "#ef4444"
                      ? "Red"
                      : annotationColor === "#22c55e"
                      ? "Green"
                      : "Blue"
                  }`,
                  icon: <FontAwesomeIcon icon={faPalette} />,
                  onClick: () => {
                    const colors = ["#3b82f6", "#ef4444", "#22c55e"]; // Blue, Red, Green
                    const currentIndex = colors.indexOf(annotationColor);
                    setAnnotationColor(
                      colors[(currentIndex + 1) % colors.length]
                    );
                  },
                },
                {
                  id: "annotationThickness",
                  type: "slider",
                  label: "Thickness",
                  meta: "Line thickness",
                  icon: <FontAwesomeIcon icon={faPen} />,
                  min: 1,
                  max: 10,
                  step: 1,
                  value: annotationStrokeWidth,
                  onChange: setAnnotationStrokeWidth,
                  displayValue: (v) => `${v}px`,
                },
                {
                  id: "clearAnnotations",
                  label: "Clear Annotations",
                  meta: "Remove all annotations",
                  icon: <FontAwesomeIcon icon={faTrash} />,
                  onClick: () => {
                    focusToolRef.current?.clearAnnotations();
                  },
                  variant: "solid",
                },
              ],
            },
            {
              id: "enhancement",
              label: "Image Enhancement",
              icon: <FontAwesomeIcon icon={faSun} />,
              items: [
                {
                  id: "brightness",
                  type: "slider",
                  label: "Brightness",
                  meta: "Adjust brightness",
                  icon: <FontAwesomeIcon icon={faSun} />,
                  min: -50,
                  max: 50,
                  step: 5,
                  value: brightness,
                  onChange: setBrightness,
                  displayValue: (v) => `${v > 0 ? "+" : ""}${v}%`,
                },
                {
                  id: "contrast",
                  type: "slider",
                  label: "Contrast",
                  meta: "Adjust contrast",
                  icon: <FontAwesomeIcon icon={faAdjust} />,
                  min: -50,
                  max: 50,
                  step: 5,
                  value: contrast,
                  onChange: setContrast,
                  displayValue: (v) => `${v > 0 ? "+" : ""}${v}%`,
                },
                {
                  id: "sharpness",
                  type: "slider",
                  label: "Sharpness",
                  meta: "Adjust sharpness",
                  icon: <FontAwesomeIcon icon={faMagic} />,
                  min: -50,
                  max: 50,
                  step: 5,
                  value: sharpness,
                  onChange: setSharpness,
                  displayValue: (v) => `${v > 0 ? "+" : ""}${v}%`,
                },
                {
                  id: "colorFilter",
                  label: "Color Filter",
                  meta: colorFilter === "none" ? "No filter" : colorFilter,
                  icon: <FontAwesomeIcon icon={faPalette} />,
                  onClick: () => {
                    const filters = ["none", "grayscale", "sepia", "invert"];
                    const currentIndex = filters.indexOf(colorFilter);
                    setColorFilter(
                      filters[(currentIndex + 1) % filters.length]
                    );
                  },
                },
              ],
            },
            {
              id: "navigation",
              label: "Navigation Tools",
              icon: <FontAwesomeIcon icon={faSearch} />,
              items: [
                {
                  id: "zoom",
                  type: "slider",
                  label: "Zoom",
                  meta: "Zoom level",
                  icon: <FontAwesomeIcon icon={faSearch} />,
                  min: 0.5,
                  max: 5,
                  step: 0.25,
                  value: zoom,
                  onChange: setZoom,
                  displayValue: (v) => `${Math.round(v * 100)}%`,
                },
                {
                  id: "pan",
                  label: "Pan Tool",
                  meta: "Move image",
                  icon: <FontAwesomeIcon icon={faHand} />,
                  onClick: () => {
                    if (zoom > 1) {
                      setPanOffset({ x: 0, y: 0 });
                    }
                  },
                },
                {
                  id: "fitToScreen",
                  label: "Fit to Screen",
                  meta: "Reset zoom & pan",
                  icon: <FontAwesomeIcon icon={faExpand} />,
                  onClick: () => {
                    setZoom(1);
                    setPanOffset({ x: 0, y: 0 });
                  },
                },
              ],
            },
            {
              id: "other",
              label: "Other Tools",
              icon: <FontAwesomeIcon icon={faMagnifyingGlass} />,
              items: [
                {
                  id: "magnifier",
                  label: showMagnifier
                    ? "Disable magnifier"
                    : "Enable magnifier",
                  meta: "Hover lens (2x)",
                  icon: <FontAwesomeIcon icon={faMagnifyingGlass} />,
                  isActive: showMagnifier,
                  onClick: () => setShowMagnifier((v) => !v),
                },
                ...(showMagnifier
                  ? [
                      {
                        id: "lensSize",
                        type: "slider",
                        label: "Lens size",
                        meta: "Adjust diameter",
                        icon: <FontAwesomeIcon icon={faCircle} />,
                        min: 80,
                        max: 240,
                        step: 10,
                        value: lensSize,
                        unit: "px",
                        onChange: setLensSize,
                      },
                      {
                        id: "lensZoom",
                        type: "slider",
                        label: "Lens zoom",
                        meta: "Increase magnification",
                        icon: <FontAwesomeIcon icon={faSearchPlus} />,
                        min: 1.5,
                        max: 3,
                        step: 0.1,
                        value: lensZoom,
                        onChange: setLensZoom,
                        displayValue: (v) => `${v.toFixed(1)}x`,
                      },
                    ]
                  : []),
                {
                  id: "regionFocus",
                  label: selectMode ? "Disable Focus Tool" : "Focus Tool",
                  meta: "Click-drag to isolate",
                  icon: <FontAwesomeIcon icon={faCropSimple} />,
                  isActive: selectMode,
                  onClick: () => {
                    const next = !selectMode;
                    setSelectMode(next);
                  },
                },
                ...(cropRect
                  ? [
                      {
                        id: "resetView",
                        label: "Reset view",
                        meta: "Show full image",
                        icon: <FontAwesomeIcon icon={faRotateLeft} />,
                        variant: "solid",
                        onClick: () => {
                          setCropRect(null);
                          setSelectMode(false);
                        },
                      },
                    ]
                  : []),
              ],
            },
          ]}
        />
      </div>
    </main>
  );
}

export default AnalysisPage;
