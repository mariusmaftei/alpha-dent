import React from "react";
import styles from "./ToolMenu.module.css";

const LegendIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 7h14M5 12h10M5 17h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="12" r="1.4" fill="currentColor" />
    <circle cx="14" cy="17" r="1.4" fill="currentColor" />
  </svg>
);

const ResultsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 5h14v14H5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 13l3 3 5-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NewIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function ToolMenu({
  title = "Tools",
  actions = [],
  onLegend,
  onResults,
  onNewAnalysis,
}) {
  return (
    <aside className={styles.menu}>
      <div className={styles.header}>{title}</div>

      <div className={styles.topActions}>
        <button className={styles.topButton} type="button" onClick={onLegend}>
          <LegendIcon />
          <span>Legend</span>
        </button>
        <button className={styles.topButton} type="button" onClick={onResults}>
          <ResultsIcon />
          <span>Results</span>
        </button>
        <button className={styles.topButton} type="button" onClick={onNewAnalysis}>
          <NewIcon />
          <span>New analysis</span>
        </button>
      </div>

      <div className={styles.actions}>
        {actions.length === 0 ? (
          <div className={styles.empty}>No tools</div>
        ) : (
          actions.map((action) => (
            <button
              key={action.id || action.label}
              className={styles.button}
              type="button"
              onClick={action.onClick}
            >
              <span>{action.label}</span>
              {action.meta && <small>{action.meta}</small>}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

export default ToolMenu;

