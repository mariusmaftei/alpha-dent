import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSearchPlus,
  faCircle,
  faCropSimple,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import ImageCanvas from "../../components/analysis/ImageCanvas";
import Legend from "../../components/UI/Legend";
import Results from "../../components/UI/Results";
import ToolMenu from "../../components/UI/ToolMenu";
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("legend"); // legend | results
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [lensSize, setLensSize] = useState(160);
  const [lensZoom, setLensZoom] = useState(2);
  const [detections] = useState(initialDetections);
  const [hiddenBoxIds, setHiddenBoxIds] = useState([]);
  const resultsItems = useMemo(
    () =>
      detections.map((d) => ({
        id: d.id,
        label: d.label,
        color: d.color,
        meta: `${(d.conf * 100).toFixed(0)}%`,
        description: `Confidence ${(d.conf * 100).toFixed(0)}%. Region ${d.box.w}×${d.box.h} px.`,
        score: d.conf,
        hidden: hiddenBoxIds.includes(d.id),
      })),
    [detections, hiddenBoxIds]
  );

  const toggleBoxVisibility = (id) => {
    setHiddenBoxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const visibleDetections = useMemo(
    () => detections.filter((d) => !hiddenBoxIds.includes(d.id)),
    [detections, hiddenBoxIds]
  );

  const [selectMode, setSelectMode] = useState(false);
  const [cropRect, setCropRect] = useState(null);

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
      <div className={styles.layout}>
        {panelMode === "legend" ? (
          <Legend collapsed={!panelOpen} items={legendItems} />
        ) : (
          <Results
            collapsed={!panelOpen}
            items={resultsItems}
            onToggleBox={toggleBoxVisibility}
          />
        )}

        <div className={styles.centerPane}>
          {image ? (
            <div className={styles.imageWrapper}>
              <ImageCanvas
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
          actions={[
            {
              id: "magnifier",
              label: showMagnifier ? "Disable magnifier" : "Enable magnifier",
              meta: "Hover lens (2x)",
              icon: <FontAwesomeIcon icon={faMagnifyingGlass} />,
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
          ]}
        />
      </div>
    </main>
  );
}

export default AnalysisPage;
