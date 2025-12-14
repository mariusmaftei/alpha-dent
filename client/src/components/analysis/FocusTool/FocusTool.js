import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import Magnifier from "../Magnifier/Magnifier";
import MeasurementTools from "../MeasurementTools/MeasurementTools";
import AnnotationTools from "../AnnotationTools/AnnotationTools";
import NavigationTools from "../NavigationTools/NavigationTools";
import styles from "./FocusTool.module.css";

const FocusTool = forwardRef(function FocusTool(
  {
    image,
    name,
    boxes = [],
    showMagnifier,
    lensSize,
    lensZoom,
    selectMode,
    cropRect,
    onCrop,
    onToggleBoxVisibility,
    activeMeasurementTool = "none",
    measurementColor = "#3b82f6",
    activeAnnotationTool = "none",
    annotationColor = "#3b82f6",
    annotationStrokeWidth = 2,
    zoom = 1,
    onZoomChange,
    panOffset = { x: 0, y: 0 },
    onPanChange,
    brightness = 0,
    contrast = 0,
    sharpness = 0,
    colorFilter = "none",
  },
  ref
) {
  const imgElRef = useRef(null);
  const measurementToolsRef = useRef(null);
  const annotationToolsRef = useRef(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      clearMeasurements: () => {
        measurementToolsRef.current?.clearMeasurements();
      },
      clearAnnotations: () => {
        annotationToolsRef.current?.clearAnnotations();
      },
    }),
    []
  );

  const getImageDisplayInfo = useCallback(() => {
    if (!imgElRef.current) return null;
    const img = imgElRef.current;
    const rect = img.getBoundingClientRect();
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    
    if (!naturalWidth || !naturalHeight) return null;
    
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;
    
    const imageAspect = naturalWidth / naturalHeight;
    const displayAspect = displayedWidth / displayedHeight;
    
    let actualImageWidth, actualImageHeight, offsetX, offsetY;
    
    if (imageAspect > displayAspect) {
      actualImageHeight = displayedHeight;
      actualImageWidth = displayedHeight * imageAspect;
      offsetX = (displayedWidth - actualImageWidth) / 2;
      offsetY = 0;
    } else {
      actualImageWidth = displayedWidth;
      actualImageHeight = displayedWidth / imageAspect;
      offsetX = 0;
      offsetY = (displayedHeight - actualImageHeight) / 2;
    }
    
    return {
      rect,
      naturalWidth,
      naturalHeight,
      actualImageWidth,
      actualImageHeight,
      offsetX,
      offsetY,
    };
  }, []);

  const toPercentRect = useCallback((start, current) => {
    const info = getImageDisplayInfo();
    if (!info) return null;
    
    const { rect, actualImageWidth, actualImageHeight, offsetX, offsetY } = info;
    
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    
    const clientX1 = start.x;
    const clientY1 = start.y;
    const clientX2 = current.x;
    const clientY2 = current.y;
    
    const localX1 = clientX1 - rect.left - offsetX;
    const localY1 = clientY1 - rect.top - offsetY;
    const localX2 = clientX2 - rect.left - offsetX;
    const localY2 = clientY2 - rect.top - offsetY;
    
    const clampedX1 = clamp(localX1, 0, actualImageWidth);
    const clampedY1 = clamp(localY1, 0, actualImageHeight);
    const clampedX2 = clamp(localX2, 0, actualImageWidth);
    const clampedY2 = clamp(localY2, 0, actualImageHeight);
    
    const left = Math.min(clampedX1, clampedX2);
    const top = Math.min(clampedY1, clampedY2);
    const width = Math.abs(clampedX2 - clampedX1);
    const height = Math.abs(clampedY2 - clampedY1);
    
    if (width < 1 || height < 1) return null;
    
    return {
      x: (left / actualImageWidth) * 100,
      y: (top / actualImageHeight) * 100,
      w: (width / actualImageWidth) * 100,
      h: (height / actualImageHeight) * 100,
    };
  }, [getImageDisplayInfo]);

  const handleSelectStart = (e) => {
    if (!selectMode || !imgElRef.current) return;
    setStartPoint({ x: e.clientX, y: e.clientY });
    setSelecting(true);
    setSelectionRect(null);
  };

  const handleSelectMove = (e) => {
    if (!selectMode || !selecting || !imgElRef.current || !startPoint) return;
    const current = { x: e.clientX, y: e.clientY };
    const rect = toPercentRect(startPoint, current);
    if (rect) {
      setSelectionRect(rect);
    }
  };

  const handleSelectEnd = (e) => {
    if (!selectMode || !selecting || !imgElRef.current || !startPoint) return;
    const current = { x: e.clientX, y: e.clientY };
    const finalRect = toPercentRect(startPoint, current);
    if (finalRect) {
      setSelectionRect(finalRect);
      onCrop?.(finalRect);
    }
    setSelecting(false);
    setStartPoint(null);
  };

  useEffect(() => {
    setSelectionRect(cropRect || null);
  }, [cropRect]);

  const focusStyle = useMemo(() => {
    if (!cropRect) return {};
    const info = getImageDisplayInfo();
    if (!info) {
      const scale = 100 / (cropRect.w || 1);
      const tx = -cropRect.x;
      const ty = -cropRect.y;
      return {
        transformOrigin: "0 0",
        transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
      };
    }
    
    const { actualImageWidth, actualImageHeight, rect, naturalWidth, naturalHeight } = info;
    
    const cropX = (cropRect.x / 100) * actualImageWidth;
    const cropY = (cropRect.y / 100) * actualImageHeight;
    const cropW = (cropRect.w / 100) * actualImageWidth;
    const cropH = (cropRect.h / 100) * actualImageHeight;
    
    const cropAspect = cropW / cropH;
    const containerAspect = rect.width / rect.height;
    
    let scale;
    if (cropAspect > containerAspect) {
      scale = rect.width / cropW;
    } else {
      scale = rect.height / cropH;
    }
    
    const tx = -((cropX / actualImageWidth) * 100);
    const ty = -((cropY / actualImageHeight) * 100);
    
    return {
      transformOrigin: "0 0",
      transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
    };
  }, [cropRect, getImageDisplayInfo]);

  const renderBoxes = () => {
    const svgStyle = {};
    if (imgElRef?.current) {
      const imgRect = imgElRef.current.getBoundingClientRect();
      const wrapper = imgElRef.current.parentElement;
      if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        svgStyle.left = `${((imgRect.left - wrapperRect.left) / wrapperRect.width) * 100}%`;
        svgStyle.top = `${((imgRect.top - wrapperRect.top) / wrapperRect.height) * 100}%`;
        svgStyle.width = `${(imgRect.width / wrapperRect.width) * 100}%`;
        svgStyle.height = `${(imgRect.height / wrapperRect.height) * 100}%`;
      }
    }

    return (
      <div className={styles.boxLayer}>
        {boxes.map((d) => {
            if (d.polygon && Array.isArray(d.polygon) && d.polygon.length > 0) {
              const path = d.polygon
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ") + " Z";
              
              return (
                <svg
                  key={d.id}
                  className={styles.polygonOverlay}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{
                    position: "absolute",
                    ...svgStyle,
                    pointerEvents: "none",
                  }}
                >
                  <path
                    d={path}
                    fill={`${d.color}33`}
                    stroke={d.color}
                    strokeWidth="0.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x={d.polygon[0]?.x || d.box.x}
                    y={(d.polygon[0]?.y || d.box.y) - 1}
                    fill={d.color}
                    fontSize="3"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {d.label} {(d.conf * 100).toFixed(0)}%
                  </text>
                </svg>
              );
            }
            
            return (
              <div
                key={d.id}
                className={styles.box}
                style={{
                  left: `${d.box.x}%`,
                  top: `${d.box.y}%`,
                  width: `${Math.min(d.box.w, d.box.h)}%`,
                  height: `${Math.min(d.box.w, d.box.h)}%`,
                  borderColor: d.color,
                  boxShadow: `0 0 0 1px ${d.color}`,
                }}
              >
                <span
                  className={styles.boxLabel}
                  style={{ backgroundColor: d.color }}
                >
                  {onToggleBoxVisibility && (
                    <button
                      type="button"
                      className={styles.badgeClose}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBoxVisibility(d.id);
                      }}
                      aria-label={`Hide ${d.label}`}
                    >
                      ×
                    </button>
                  )}
                  {d.label} · {(d.conf * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
      </div>
    );
  };

  const activeClip = useMemo(() => {
    if (!cropRect) return null;
    
    const info = getImageDisplayInfo();
    if (!info) {
      return {
        clipPath: `polygon(${cropRect.x}% ${cropRect.y}%, ${cropRect.x + cropRect.w}% ${
          cropRect.y
        }%, ${cropRect.x + cropRect.w}% ${cropRect.y + cropRect.h}%, ${cropRect.x}% ${
          cropRect.y + cropRect.h
        }%)`,
      };
    }
    
    const { actualImageWidth, actualImageHeight, offsetX, offsetY, rect } = info;
    
    const clipX = ((cropRect.x / 100) * actualImageWidth + offsetX) / rect.width * 100;
    const clipY = ((cropRect.y / 100) * actualImageHeight + offsetY) / rect.height * 100;
    const clipW = (cropRect.w / 100) * actualImageWidth / rect.width * 100;
    const clipH = (cropRect.h / 100) * actualImageHeight / rect.height * 100;
    
    return {
      clipPath: `polygon(${clipX}% ${clipY}%, ${clipX + clipW}% ${clipY}%, ${clipX + clipW}% ${
        clipY + clipH
      }%, ${clipX}% ${clipY + clipH}%)`,
      width: `${clipW}%`,
      height: `${clipH}%`,
      left: `${clipX}%`,
      top: `${clipY}%`,
    };
  }, [cropRect, getImageDisplayInfo]);
  const showSelectionBox = (selecting || selectionRect) && selectionRect;

  const enhancedStyle = useMemo(() => {
    const filters = [];
    if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`);
    if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`);
    if (sharpness !== 0) {
      const amount = sharpness / 100;
      filters.push(`contrast(${1 + amount * 0.5})`);
    }
    if (colorFilter === "grayscale") filters.push("grayscale(100%)");
    else if (colorFilter === "sepia") filters.push("sepia(100%)");
    else if (colorFilter === "invert") filters.push("invert(100%)");
    return { filter: filters.length > 0 ? filters.join(" ") : "none" };
  }, [brightness, contrast, sharpness, colorFilter]);

  const imageStyle = useMemo(() => {
    const transforms = [];
    
    if (cropRect) {
      if (focusStyle.transform) {
        transforms.push(focusStyle.transform);
      }
    }
    
    if (panOffset.x !== 0 || panOffset.y !== 0) {
      transforms.push(`translate(${panOffset.x}px, ${panOffset.y}px)`);
    }
    
    if (zoom !== 1) {
      transforms.push(`scale(${zoom})`);
    }
    
    const baseStyle = {
      ...focusStyle,
      transform: transforms.length > 0 ? transforms.join(" ") : "none",
      transformOrigin: cropRect ? "0 0" : "center center",
    };
    
    if (activeClip) {
      baseStyle.clipPath = activeClip.clipPath;
    }
    
    return { ...baseStyle, ...enhancedStyle };
  }, [activeClip, focusStyle, panOffset, zoom, enhancedStyle, cropRect]);

  return (
    <div className={styles.imageWrapper}>
      {showMagnifier ? (
        <Magnifier
          src={image}
          alt={name || "Uploaded intraoral"}
          zoom={lensZoom}
          size={lensSize}
          imageClassName={styles.fullImage}
          imageRef={imgElRef}
          style={imageStyle}
        >
          <div
            className={styles.boxLayer}
            style={{ ...activeClip, ...focusStyle }}
          >
            {renderBoxes()}
          </div>
        </Magnifier>
      ) : (
        <>
          <img
            src={image}
            alt={name || "Uploaded intraoral"}
            className={styles.fullImage}
            ref={imgElRef}
            style={imageStyle}
          />
          <div
            className={styles.boxLayer}
            style={{ ...activeClip, ...focusStyle }}
          >
            {renderBoxes()}
          </div>
        </>
      )}

      <MeasurementTools
        ref={measurementToolsRef}
        activeTool={activeMeasurementTool}
        imageRef={imgElRef}
        color={measurementColor}
      />

      <AnnotationTools
        ref={annotationToolsRef}
        activeTool={activeAnnotationTool}
        imageRef={imgElRef}
        color={annotationColor}
        strokeWidth={annotationStrokeWidth}
      />

      <NavigationTools
        imageRef={imgElRef}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onPanChange={onPanChange}
      />

      <div
        className={styles.selectionLayer}
        style={{
          pointerEvents:
            selectMode &&
            activeMeasurementTool === "none" &&
            activeAnnotationTool === "none"
              ? "auto"
              : "none",
        }}
        onMouseDown={handleSelectStart}
        onMouseMove={handleSelectMove}
        onMouseUp={handleSelectEnd}
      >
        {showSelectionBox && !cropRect && (
          <div
            className={styles.selectionBox}
            style={{
              left: `${selectionRect.x}%`,
              top: `${selectionRect.y}%`,
              width: `${selectionRect.w}%`,
              height: `${selectionRect.h}%`,
            }}
          />
        )}
      </div>
    </div>
  );
});

FocusTool.displayName = "FocusTool";

export default FocusTool;
