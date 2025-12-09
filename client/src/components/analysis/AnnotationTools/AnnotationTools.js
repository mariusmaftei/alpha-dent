import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import styles from "./AnnotationTools.module.css";

const AnnotationTools = forwardRef(function AnnotationTools({ activeTool, imageRef, color = "#3b82f6", strokeWidth = 2 }, ref) {
  const [annotations, setAnnotations] = useState([]);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState(null);
  const canvasRef = useRef(null);
  const startPointRef = useRef(null);
  const textInputRef = useRef(null);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setCurrentAnnotation(null);
    setIsDrawing(false);
    setTextInput(null);
    startPointRef.current = null;
  }, []);

  useImperativeHandle(ref, () => ({
    clearAnnotations,
    hasAnnotations: annotations.length > 0 || currentAnnotation !== null,
  }), [clearAnnotations, annotations.length, currentAnnotation]);

  const getImageCoords = useCallback((e) => {
    if (!imageRef?.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, [imageRef]);

  const handleMouseDown = (e) => {
    if (!activeTool || activeTool === "none") return;
    const point = getImageCoords(e);
    if (!point) return;

    setIsDrawing(true);
    startPointRef.current = point;

    if (activeTool === "draw" || activeTool === "pen") {
      setCurrentAnnotation({
        type: "draw",
        points: [point],
        color,
        strokeWidth,
      });
    } else if (activeTool === "rectangle") {
      setCurrentAnnotation({
        type: "rectangle",
        start: point,
        end: point,
        color,
        strokeWidth,
      });
    } else if (activeTool === "circle") {
      setCurrentAnnotation({
        type: "circle",
        center: point,
        radius: 0,
        color,
        strokeWidth,
      });
    } else if (activeTool === "arrow") {
      setCurrentAnnotation({
        type: "arrow",
        start: point,
        end: point,
        color,
        strokeWidth,
      });
    } else if (activeTool === "text") {
      setTextInput({
        position: point,
        text: "",
      });
      setIsDrawing(false);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
      return;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentAnnotation) return;
    const point = getImageCoords(e);
    if (!point) return;

    if (activeTool === "draw" || activeTool === "pen") {
      setCurrentAnnotation({
        ...currentAnnotation,
        points: [...currentAnnotation.points, point],
      });
    } else if (activeTool === "rectangle") {
      setCurrentAnnotation({
        ...currentAnnotation,
        end: point,
      });
    } else if (activeTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(point.x - currentAnnotation.center.x, 2) +
          Math.pow(point.y - currentAnnotation.center.y, 2)
      );
      setCurrentAnnotation({
        ...currentAnnotation,
        radius,
      });
    } else if (activeTool === "arrow") {
      setCurrentAnnotation({
        ...currentAnnotation,
        end: point,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAnnotation) return;

    const newAnnotation = {
      ...currentAnnotation,
      id: Date.now().toString(),
    };
    setAnnotations([...annotations, newAnnotation]);
    setCurrentAnnotation(null);
    setIsDrawing(false);
  };

  const handleEraser = (e) => {
    if (activeTool !== "eraser") return;
    const point = getImageCoords(e);
    if (!point) return;

    setAnnotations((prev) =>
      prev.filter((ann) => {
        if (ann.type === "text") {
          const dist = Math.sqrt(
            Math.pow(ann.position.x - point.x, 2) +
              Math.pow(ann.position.y - point.y, 2)
          );
          return dist > 2;
        }
        return true;
      })
    );
  };

  const handleTextKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      if (textInput && textInput.text.trim()) {
        const newAnnotation = {
          id: Date.now().toString(),
          type: "text",
          position: textInput.position,
          text: textInput.text,
          color,
        };
        setAnnotations([...annotations, newAnnotation]);
      }
      setTextInput(null);
    } else if (e.key === "Escape") {
      setTextInput(null);
    }
  };

  const handleTextChange = (e) => {
    setTextInput({
      ...textInput,
      text: e.target.value,
    });
  };

  if (!activeTool || activeTool === "none") return null;

  const cursor =
    activeTool === "eraser"
      ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><circle cx=\"10\" cy=\"10\" r=\"8\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"2\"/></svg>') 10 10, crosshair"
      : activeTool === "text"
      ? "text"
      : "crosshair";

  return (
    <div
      className={styles.annotationLayer}
      onMouseDown={activeTool === "eraser" ? handleEraser : handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor }}
    >
      {annotations.map((ann) => (
        <AnnotationDisplay key={ann.id} annotation={ann} imageRef={imageRef} />
      ))}
      {currentAnnotation && (
        <AnnotationDisplay annotation={currentAnnotation} isActive imageRef={imageRef} />
      )}
      {textInput && (
        <textarea
          ref={textInputRef}
          className={styles.textInput}
          style={{
            left: `${textInput.position.x}%`,
            top: `${textInput.position.y}%`,
            color: color,
            borderColor: color,
          }}
          value={textInput.text}
          onChange={handleTextChange}
          onKeyDown={handleTextKeyDown}
          placeholder="Enter text (Ctrl+Enter to save, Esc to cancel)"
          autoFocus
        />
      )}
    </div>
  );
});

function AnnotationDisplay({ annotation, isActive = false, imageRef }) {
  const getSvgStrokeWidth = (pixelWidth) => {
    if (!imageRef?.current) return pixelWidth;
    const imgRect = imageRef.current.getBoundingClientRect();
    const imageWidth = imgRect.width;
    if (imageWidth === 0) return pixelWidth;
    return (pixelWidth / imageWidth) * 100;
  };

  if (annotation.type === "draw" || annotation.type === "pen") {
    if (annotation.points.length < 2) return null;
    const path = annotation.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const svgStyle = {};
    if (imageRef?.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const wrapper = imageRef.current.parentElement;
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        svgStyle.left = `${((imgRect.left - wrapperRect.left) / wrapperRect.width) * 100}%`;
        svgStyle.top = `${((imgRect.top - wrapperRect.top) / wrapperRect.height) * 100}%`;
        svgStyle.width = `${(imgRect.width / wrapperRect.width) * 100}%`;
        svgStyle.height = `${(imgRect.height / wrapperRect.height) * 100}%`;
      }
    }

    const strokeWidthPx = annotation.strokeWidth ?? 2;
    const svgStrokeWidth = getSvgStrokeWidth(strokeWidthPx);

    return (
      <svg
        className={styles.annotationSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ 
          position: "absolute", 
          ...svgStyle,
          pointerEvents: "none" 
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={annotation.color}
          strokeWidth={svgStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (annotation.type === "rectangle") {
    const x = Math.min(annotation.start.x, annotation.end.x);
    const y = Math.min(annotation.start.y, annotation.end.y);
    const w = Math.abs(annotation.end.x - annotation.start.x);
    const h = Math.abs(annotation.end.y - annotation.start.y);
    const strokeWidth = annotation.strokeWidth ?? 2;

    return (
      <div
        className={styles.rectangle}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${w}%`,
          height: `${h}%`,
          borderColor: annotation.color,
          borderWidth: `${strokeWidth}px`,
        }}
      />
    );
  }

  if (annotation.type === "circle") {
    const strokeWidth = annotation.strokeWidth ?? 2;
    return (
      <div
        className={styles.circle}
        style={{
          left: `${annotation.center.x - annotation.radius}%`,
          top: `${annotation.center.y - annotation.radius}%`,
          width: `${annotation.radius * 2}%`,
          height: `${annotation.radius * 2}%`,
          borderColor: annotation.color,
          borderWidth: `${strokeWidth}px`,
        }}
      />
    );
  }

  if (annotation.type === "arrow") {
    const dx = annotation.end.x - annotation.start.x;
    const dy = annotation.end.y - annotation.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const strokeWidthPx = annotation.strokeWidth ?? 2;
    const svgStrokeWidth = getSvgStrokeWidth(strokeWidthPx);
    
    const arrowHeadSize = Math.max(1.5, svgStrokeWidth * 1.2);
    const arrowLength = Math.max(0, length - arrowHeadSize);
    
    const arrowHeadPoints = [
      { x: annotation.end.x, y: annotation.end.y },
      {
        x: annotation.end.x - arrowHeadSize * Math.cos(Math.atan2(dy, dx)),
        y: annotation.end.y - arrowHeadSize * Math.sin(Math.atan2(dy, dx)),
      },
    ];
    
    const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
    const arrowHeadWidth = arrowHeadSize * 0.35;
    
    const arrowHeadPath = [
      `M ${annotation.end.x} ${annotation.end.y}`,
      `L ${arrowHeadPoints[1].x + arrowHeadWidth * Math.cos(perpAngle)} ${arrowHeadPoints[1].y + arrowHeadWidth * Math.sin(perpAngle)}`,
      `L ${arrowHeadPoints[1].x - arrowHeadWidth * Math.cos(perpAngle)} ${arrowHeadPoints[1].y - arrowHeadWidth * Math.sin(perpAngle)}`,
      `Z`,
    ].join(" ");

    const svgStyle = {};
    if (imageRef?.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const wrapper = imageRef.current.parentElement;
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        svgStyle.left = `${((imgRect.left - wrapperRect.left) / wrapperRect.width) * 100}%`;
        svgStyle.top = `${((imgRect.top - wrapperRect.top) / wrapperRect.height) * 100}%`;
        svgStyle.width = `${(imgRect.width / wrapperRect.width) * 100}%`;
        svgStyle.height = `${(imgRect.height / wrapperRect.height) * 100}%`;
      }
    }

    return (
      <svg
        className={styles.annotationSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ 
          position: "absolute", 
          ...svgStyle,
          pointerEvents: "none" 
        }}
      >
        <line
          x1={annotation.start.x}
          y1={annotation.start.y}
          x2={arrowHeadPoints[1].x}
          y2={arrowHeadPoints[1].y}
          stroke={annotation.color}
          strokeWidth={svgStrokeWidth}
          strokeLinecap="round"
        />
        <path
          d={arrowHeadPath}
          fill={annotation.color}
          stroke={annotation.color}
          strokeWidth={svgStrokeWidth}
        />
      </svg>
    );
  }

  if (annotation.type === "text") {
    return (
      <div
        className={styles.text}
        style={{
          left: `${annotation.position.x}%`,
          top: `${annotation.position.y}%`,
          color: annotation.color,
        }}
      >
        {annotation.text}
      </div>
    );
  }

  return null;
}

AnnotationTools.displayName = "AnnotationTools";

export default AnnotationTools;

