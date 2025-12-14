import React, { useEffect, useState } from "react";
import styles from "./Toast.module.css";

function Toast({ message, type = "error", onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;

