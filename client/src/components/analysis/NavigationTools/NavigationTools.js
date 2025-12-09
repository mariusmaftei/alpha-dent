import React, { useRef, useState, useCallback, useEffect } from "react";
import styles from "./NavigationTools.module.css";

function NavigationTools({ imageRef, zoom = 1, onZoomChange, onPanChange }) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    panOffsetRef.current = panOffset;
    onPanChange?.(panOffset);
  }, [panOffset, onPanChange]);

  const handleZoomIn = () => {
    onZoomChange?.(Math.min(zoom + 0.25, 5));
  };

  const handleZoomOut = () => {
    onZoomChange?.(Math.max(zoom - 0.25, 0.5));
  };

  const handleFitToScreen = () => {
    onZoomChange?.(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleActualSize = () => {
    onZoomChange?.(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePanStart = (e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y });
  };

  const handlePanMove = (e) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  return (
    <>
      <div
        className={styles.panLayer}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          display: zoom > 1 ? "block" : "none",
        }}
      />
      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          −
        </button>
        <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
        <button
          className={styles.controlButton}
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
        <button
          className={styles.controlButton}
          onClick={handleFitToScreen}
          title="Fit to Screen"
        >
          ⤢
        </button>
        <button
          className={styles.controlButton}
          onClick={handleActualSize}
          title="Actual Size"
        >
          1:1
        </button>
      </div>
    </>
  );
}

export default NavigationTools;

