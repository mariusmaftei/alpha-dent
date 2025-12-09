import React from "react";
import styles from "./AnalyzingOverlay.module.css";

function AnalyzingOverlay({ label = "Analyzing..." }) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <p className={styles.text}>{label}</p>
    </div>
  );
}

export default AnalyzingOverlay;
