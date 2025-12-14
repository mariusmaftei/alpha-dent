import React, { useMemo, useState } from "react";
import { FaTooth } from "react-icons/fa";
import styles from "./Results.module.css";

function Results({ items = [], collapsed = false, onToggleBox, onShowAll, onHideAll, onExport, imageName }) {
  const [classFilter, setClassFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  
  const allVisible = items.length > 0 && items.every((item) => !item.hidden);
  const allHidden = items.length > 0 && items.every((item) => item.hidden);

  const classOptions = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.label)))],
    [items]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const passesClass = classFilter === "all" || item.label === classFilter;
        const passesScore =
          scoreFilter === "all" || (item.score ?? 0) >= Number(scoreFilter);
        return passesClass && passesScore;
      }),
    [items, classFilter, scoreFilter]
  );

  return (
    <aside
      className={`${styles.results} ${collapsed ? styles.collapsed : ""}`}
      aria-hidden={collapsed}
    >
      <div className={styles.header}>
        <span>Results</span>
        <span className={styles.count}>{filteredItems.length}</span>
      </div>
      <div className={styles.filters}>
        <label className={styles.filter}>
          <span>Class</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            {classOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All classes" : opt}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filter}>
          <span>Min conf.</span>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="50">≥ 50%</option>
            <option value="70">≥ 70%</option>
            <option value="85">≥ 85%</option>
          </select>
        </label>
        {(onShowAll || onHideAll || onExport) && (
          <div className={styles.actions}>
            {!allVisible && onShowAll && (
              <button
                className={styles.actionButton}
                onClick={onShowAll}
                type="button"
              >
                Show All
              </button>
            )}
            {!allHidden && onHideAll && (
              <button
                className={styles.actionButton}
                onClick={onHideAll}
                type="button"
              >
                Hide All
              </button>
            )}
            {onExport && items.length > 0 && (
              <button
                className={styles.actionButton}
                onClick={onExport}
                type="button"
                style={{ marginTop: "8px", width: "100%" }}
              >
                Export CSV
              </button>
            )}
          </div>
        )}
      </div>
      <div className={styles.list}>
        {filteredItems.length === 0 ? (
          <div className={styles.empty}>No results</div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id || item.label}
              className={`${styles.item} ${item.hidden ? styles.hidden : ""}`}
              style={{
                borderLeftColor: item.color || "#323232",
              }}
              onClick={() => onToggleBox && onToggleBox(item.id)}
            >
              <div className={styles.content}>
                <div className={styles.headerRow}>
                  <span className={styles.title}>{item.label}</span>
                  {item.meta && (
                    <span
                      className={styles.confidenceBadge}
                      style={{ backgroundColor: item.color || "#323232" }}
                    >
                      {item.meta}
                    </span>
                  )}
                </div>
                <div className={styles.detailsRow}>
                  <span
                    className={styles.icon}
                    style={{ color: item.color || "inherit" }}
                  >
                    <FaTooth />
                  </span>
                  {item.description && (
                    <span className={styles.description}>{item.description}</span>
                  )}
                </div>
                {onToggleBox && (
                  <div className={styles.toggle}>
                    {item.hidden ? "Show" : "Hide"}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Results;

