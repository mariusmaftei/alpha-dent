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
  resultsCount,
}) {
  return (
    <aside className={styles.menu}>
      <div className={styles.header}>{title}</div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Navigation</div>
        <div className={styles.topActions}>
          <button className={styles.linkButton} type="button" onClick={onLegend}>
            <div className={styles.buttonContent}>
              <LegendIcon />
              <span>Legend</span>
            </div>
          </button>
          <button className={styles.linkButton} type="button" onClick={onResults}>
            <div className={styles.buttonContent}>
              <ResultsIcon />
              <span>Results</span>
            </div>
            {resultsCount !== undefined && (
              <span className={styles.badge}>{resultsCount}</span>
            )}
          </button>
          <button className={styles.linkButton} type="button" onClick={onNewAnalysis}>
            <div className={styles.buttonContent}>
              <NewIcon />
              <span>New analysis</span>
            </div>
          </button>
        </div>
      </div>

      <hr className={styles.rule} />

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Tools</div>
        <div className={styles.actions}>
        {actions.length === 0 ? (
          <div className={styles.empty}>No tools</div>
        ) : (
          actions.map((action) =>
            action.type === "slider" ? (
              <div key={action.id || action.label} className={styles.sliderRow}>
                <div className={styles.sliderHeader}>
                  {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                  <div className={styles.actionText}>
                    <span className={styles.actionLabel}>{action.label}</span>
                  </div>
                  <span className={styles.sliderValue}>
                    {action.displayValue
                      ? action.displayValue(action.value)
                      : `${action.value}${action.unit || ""}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={action.min}
                  max={action.max}
                  step={action.step || 1}
                  value={action.value}
                  onChange={(e) => action.onChange?.(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            ) : (
              <button
                key={action.id || action.label}
                className={
                  action.variant === "solid"
                    ? styles.primaryButton
                    : styles.linkButton
                }
                type="button"
                onClick={action.onClick}
              >
                <div className={styles.buttonContent}>
                  {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                  <span className={styles.actionText}>
                    <span className={styles.actionLabel}>{action.label}</span>
                  </span>
                </div>
              </button>
            )
          )
        )}
        </div>
      </div>
    </aside>
  );
}

export default ToolMenu;

