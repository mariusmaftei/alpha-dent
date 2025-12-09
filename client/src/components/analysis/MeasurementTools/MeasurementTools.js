import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import styles from "./MeasurementTools.module.css";

const MeasurementTools = forwardRef(function MeasurementTools({ activeTool, imageRef, onMeasurement, color = "#3b82f6" }, ref) {
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPointRef = useRef(null);
  const canvasRef = useRef(null);
  const currentLineEndRef = useRef(null);

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setIsDrawing(false);
    startPointRef.current = null;
  }, []);

  useImperativeHandle(ref, () => ({
    clearMeasurements,
    hasMeasurements: measurements.length > 0 || currentMeasurement !== null,
  }), [clearMeasurements, measurements.length, currentMeasurement]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTool === "area" && e.key === "Enter" && currentMeasurement) {
        const points = currentMeasurement.points || [];
        if (points.length >= 3) {
          let area = 0;
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
          }
          area = Math.abs(area / 2);
          const finalMeasurement = {
            ...currentMeasurement,
            area: area.toFixed(2),
            id: Date.now().toString(),
          };
          setMeasurements([...measurements, finalMeasurement]);
          setCurrentMeasurement(null);
          setIsDrawing(false);
          startPointRef.current = null;
          currentLineEndRef.current = null;
          onMeasurement?.(finalMeasurement);
        }
      }
    };

    if (activeTool === "area") {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [activeTool, currentMeasurement, measurements, onMeasurement]);

  const getImageCoords = useCallback((e) => {
    if (!imageRef?.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  }, [imageRef]);

  const calculateDistance = (p1, p2, imageRect) => {
    // Convert percentage coordinates to pixels
    const p1Px = {
      x: (p1.x / 100) * imageRect.width,
      y: (p1.y / 100) * imageRect.height,
    };
    const p2Px = {
      x: (p2.x / 100) * imageRect.width,
      y: (p2.y / 100) * imageRect.height,
    };
    const dx = p2Px.x - p1Px.x;
    const dy = p2Px.y - p1Px.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateAngle = (p1, p2, p3) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    const angle = Math.acos(cosAngle);
    return (angle * 180) / Math.PI;
  };

  const handleMouseDown = (e) => {
    if (!activeTool || activeTool === "none") return;
    const point = getImageCoords(e);
    if (!point) return;

    if (activeTool === "angle") {
      if (!currentMeasurement) {
        // First click - set point 1
        setCurrentMeasurement({
          type: "angle",
          p1: point,
          p2: point,
          p3: point,
          angle: 0,
          step: 1,
          color: color,
        });
        setIsDrawing(false);
        return;
      } else if (currentMeasurement.step === 1) {
        // Second click - set vertex (p2)
        setCurrentMeasurement({
          ...currentMeasurement,
          p2: point,
          step: 2,
        });
        setIsDrawing(false);
        return;
      } else if (currentMeasurement.step === 2) {
        // Third click - set point 3 and finalize
        const angle = calculateAngle(
          currentMeasurement.p1,
          currentMeasurement.p2,
          point
        );
        const newMeasurement = {
          ...currentMeasurement,
          p3: point,
          angle: angle.toFixed(1),
          id: Date.now().toString(),
          color: color,
        };
        setMeasurements([...measurements, newMeasurement]);
        setCurrentMeasurement(null);
        setIsDrawing(false);
        onMeasurement?.(newMeasurement);
        return;
      }
    }

    setIsDrawing(true);
    startPointRef.current = point;

    if (activeTool === "ruler") {
      setCurrentMeasurement({
        type: "ruler",
        start: point,
        end: point,
        distance: 0,
        color: color,
      });
    } else if (activeTool === "area") {
      if (!currentMeasurement) {
        setCurrentMeasurement({
          type: "area",
          points: [point],
          area: 0,
          color: color,
        });
        setIsDrawing(true);
        startPointRef.current = point;
        currentLineEndRef.current = point;
      } else {
        setIsDrawing(true);
        startPointRef.current = point;
        currentLineEndRef.current = point;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!activeTool || !currentMeasurement) return;
    const point = getImageCoords(e);
    if (!point) return;

    if (activeTool === "ruler") {
      if (!isDrawing) return;
      if (!imageRef?.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const distance = calculateDistance(startPointRef.current, point, rect);
      setCurrentMeasurement({
        ...currentMeasurement,
        end: point,
        distance: Math.round(distance),
        distancePx: true,
      });
      return;
    }

    if (activeTool === "area") {
      if (!isDrawing || !currentMeasurement) return;
      currentLineEndRef.current = point;
      return;
    }

    if (activeTool === "angle") {
      if (currentMeasurement.step === 1) {
        setCurrentMeasurement({
          ...currentMeasurement,
          p2: point,
        });
      } else if (currentMeasurement.step === 2) {
        const angle = calculateAngle(
          currentMeasurement.p1,
          currentMeasurement.p2,
          point
        );
        setCurrentMeasurement({
          ...currentMeasurement,
          p3: point,
          angle: angle.toFixed(1),
        });
      }
      return;
    }
  };

  const handleMouseUp = (e) => {
    // Angle tool is handled entirely in handleMouseDown (click-based)
    if (activeTool === "angle") return;

    if (!isDrawing || !currentMeasurement) return;

    if (activeTool === "area") {
      if (!isDrawing || !currentMeasurement || !startPointRef.current || !currentLineEndRef.current) {
        setIsDrawing(false);
        return;
      }
      
      const newPoint = currentLineEndRef.current;
      const currentPoints = currentMeasurement.points || [];
      
      if (currentPoints.length === 0 || 
          Math.abs(currentPoints[currentPoints.length - 1].x - newPoint.x) > 0.1 ||
          Math.abs(currentPoints[currentPoints.length - 1].y - newPoint.y) > 0.1) {
        const updatedPoints = [...currentPoints, newPoint];
        setCurrentMeasurement({
          ...currentMeasurement,
          points: updatedPoints,
        });
      }
      
      setIsDrawing(false);
      startPointRef.current = null;
      currentLineEndRef.current = null;
      return;
    }

    // Ensure final measurement has pixel distance and color
    if (activeTool === "ruler" && imageRef?.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const distance = calculateDistance(
        currentMeasurement.start,
        currentMeasurement.end,
        rect
      );
      currentMeasurement.distance = Math.round(distance);
      currentMeasurement.distancePx = true;
    }

    const newMeasurement = {
      ...currentMeasurement,
      id: Date.now().toString(),
      color: color, // Store the color with the measurement
    };
    setMeasurements([...measurements, newMeasurement]);
    setCurrentMeasurement(null);
    setIsDrawing(false);
    onMeasurement?.(newMeasurement);
  };

  if (!activeTool || activeTool === "none") return null;

  return (
    <div
      className={styles.measurementLayer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: activeTool === "ruler" ? "crosshair" : "crosshair" }}
    >
      {measurements.map((m) => (
        <MeasurementDisplay key={m.id} measurement={m} color={color} imageRef={imageRef} />
      ))}
      {currentMeasurement && (
        <MeasurementDisplay 
          measurement={currentMeasurement} 
          isActive 
          color={color} 
          imageRef={imageRef}
          previewLineEnd={activeTool === "area" && isDrawing ? currentLineEndRef.current : null}
        />
      )}
    </div>
  );
});

function MeasurementDisplay({ measurement, isActive = false, color, imageRef, previewLineEnd = null }) {
  const displayColor = measurement.color || color || "#3b82f6";
  if (measurement.type === "ruler") {
    const dx = measurement.end.x - measurement.start.x;
    const dy = measurement.end.y - measurement.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <div
        className={`${styles.ruler} ${isActive ? styles.active : ""}`}
        style={{
          left: `${measurement.start.x}%`,
          top: `${measurement.start.y}%`,
          width: `${length}%`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "0 0",
        }}
      >
        <div 
          className={styles.rulerLine} 
          style={isActive ? {
            background: `transparent`,
            backgroundImage: `repeating-linear-gradient(to right, ${displayColor} 0px, ${displayColor} 4px, transparent 4px, transparent 8px)`,
            boxShadow: `0 0 6px ${displayColor}cc`,
            animation: "dashMove 0.5s linear infinite",
          } : {
            backgroundColor: displayColor,
            boxShadow: `0 0 4px ${displayColor}80`,
          }}
        />
        <div
          className={styles.rulerPoint}
          style={{
            left: 0,
            top: 0,
            backgroundColor: displayColor,
            borderColor: "white",
            boxShadow: `0 0 4px ${displayColor}cc`,
          }}
        />
        <div
          className={styles.rulerPoint}
          style={{
            left: "100%",
            top: 0,
            backgroundColor: displayColor,
            borderColor: "white",
            boxShadow: `0 0 4px ${displayColor}cc`,
          }}
        />
        <div className={styles.rulerLabel} style={{ backgroundColor: `${displayColor}e6`, color: "white" }}>
          {measurement.distance}{measurement.distancePx ? "px" : "%"}
        </div>
      </div>
    );
  }

  if (measurement.type === "angle") {
    const hasFirstLine =
      measurement.p1 &&
      measurement.p2 &&
      (measurement.p1.x !== measurement.p2.x || measurement.p1.y !== measurement.p2.y);
    const showP3 =
      measurement.p3 &&
      (measurement.p3.x !== measurement.p2.x || measurement.p3.y !== measurement.p2.y);

    if (!hasFirstLine) return null;

    const angleStyle = {};
    if (imageRef?.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const wrapper = imageRef.current.parentElement;
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        angleStyle.left = `${((imgRect.left - wrapperRect.left) / wrapperRect.width) * 100}%`;
        angleStyle.top = `${((imgRect.top - wrapperRect.top) / wrapperRect.height) * 100}%`;
        angleStyle.width = `${(imgRect.width / wrapperRect.width) * 100}%`;
        angleStyle.height = `${(imgRect.height / wrapperRect.height) * 100}%`;
      }
    }

    return (
      <div className={`${styles.angle} ${isActive ? styles.active : ""}`} style={angleStyle}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <line
            x1={measurement.p1.x}
            y1={measurement.p1.y}
            x2={measurement.p2.x}
            y2={measurement.p2.y}
            stroke={displayColor}
            strokeWidth="0.5"
            strokeLinecap="round"
          />
          {showP3 && (
            <>
              <line
                x1={measurement.p2.x}
                y1={measurement.p2.y}
                x2={measurement.p3.x}
                y2={measurement.p3.y}
                stroke={displayColor}
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              {measurement.angle && (
                <text
                  x={measurement.p2.x}
                  y={measurement.p2.y - 2}
                  fill={displayColor}
                  fontSize="5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {measurement.angle}°
                </text>
              )}
            </>
          )}
        </svg>
      </div>
    );
  }

  if (measurement.type === "area") {
    const points = measurement.points || [];
    
    if (points.length === 0 && !isActive) return null;
    
    let path = "";
    if (points.length > 0) {
      path = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      if (points.length >= 3 && measurement.area > 0) {
        path += " Z";
      }
    }

    const showPreview = isActive && previewLineEnd && points.length > 0;
    const lastPoint = points[points.length - 1];

    return (
      <svg
        className={`${styles.area} ${isActive ? styles.active : ""}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {path && (
          <path
            d={path}
            fill={points.length >= 3 && measurement.area > 0 ? `${displayColor}33` : "none"}
            stroke={displayColor}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {showPreview && lastPoint && (
          <line
            x1={lastPoint.x}
            y1={lastPoint.y}
            x2={previewLineEnd.x}
            y2={previewLineEnd.y}
            stroke={displayColor}
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}
        {measurement.area > 0 && points.length > 0 && (
          <text
            x={points[0].x}
            y={points[0].y - 2}
            fill={displayColor}
            fontSize="5"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            Area: {measurement.area}%
          </text>
        )}
      </svg>
    );
  }

  return null;
}

MeasurementTools.displayName = "MeasurementTools";

export default MeasurementTools;

