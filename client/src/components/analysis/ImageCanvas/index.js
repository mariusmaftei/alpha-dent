import React, { useEffect, useMemo, useRef, useState } from "react";
import Magnifier from "../Magnifier";
import styles from "./index.module.css";

function ImageCanvas({
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
}) {
  const imgElRef = useRef(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  const toPercentRect = (start, current, rect) => {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const x1 = clamp(start.x, 0, rect.width);
    const y1 = clamp(start.y, 0, rect.height);
    const x2 = clamp(current.x, 0, rect.width);
    const y2 = clamp(current.y, 0, rect.height);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return {
      x: (left / rect.width) * 100,
      y: (top / rect.height) * 100,
      w: (width / rect.width) * 100,
      h: (height / rect.height) * 100,
    };
  };

  const handleSelectStart = (e) => {
    if (!selectMode || !imgElRef.current) return;
    const rect = imgElRef.current.getBoundingClientRect();
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelecting(true);
    setSelectionRect(null);
  };

  const handleSelectMove = (e) => {
    if (!selectMode || !selecting || !imgElRef.current || !startPoint) return;
    const rect = imgElRef.current.getBoundingClientRect();
    const current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setSelectionRect(toPercentRect(startPoint, current, rect));
  };

  const handleSelectEnd = (e) => {
    if (!selectMode || !selecting || !imgElRef.current || !startPoint) return;
    const rect = imgElRef.current.getBoundingClientRect();
    const current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const finalRect = toPercentRect(startPoint, current, rect);
    setSelectionRect(finalRect);
    onCrop?.(finalRect);
    setSelecting(false);
    setStartPoint(null);
  };

  useEffect(() => {
    setSelectionRect(cropRect || null);
  }, [cropRect]);

  const focusStyle = useMemo(() => {
    if (!cropRect) return {};
    const scale = 100 / (cropRect.w || 1);
    const tx = -cropRect.x;
    const ty = -cropRect.y;
    return {
      transformOrigin: "0 0",
      transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
    };
  }, [cropRect]);

  const renderBoxes = () => (
    <div className={styles.boxLayer}>
      {boxes.map((d) => (
        // force square boxes using the smallest dimension
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
      ))}
    </div>
  );

  const clipStyle = (rect) =>
    rect
      ? {
          clipPath: `polygon(${rect.x}% ${rect.y}%, ${rect.x + rect.w}% ${
            rect.y
          }%, ${rect.x + rect.w}% ${rect.y + rect.h}%, ${rect.x}% ${
            rect.y + rect.h
          }%)`,
        }
      : {};

  const activeClip = cropRect || null;
  const showSelectionBox = (selecting || selectionRect) && selectionRect;

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
          style={{ ...activeClip, ...focusStyle }}
        >
          <div className={styles.boxLayer} style={{ ...activeClip, ...focusStyle }}>
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
            style={{ ...activeClip, ...focusStyle }}
          />
          <div className={styles.boxLayer} style={{ ...activeClip, ...focusStyle }}>
            {renderBoxes()}
          </div>
        </>
      )}

      <div
        className={styles.selectionLayer}
        style={{ pointerEvents: selectMode ? "auto" : "none" }}
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
}

export default ImageCanvas;

