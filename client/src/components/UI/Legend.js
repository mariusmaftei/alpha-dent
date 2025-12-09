import React from "react";
import styles from "./Legend.module.css";

function Legend({ items = [], collapsed = false }) {
  return (
    <aside
      className={`${styles.legend} ${collapsed ? styles.collapsed : ""}`}
      aria-hidden={collapsed}
    >
      <div className={styles.header}>Legend</div>
      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>No legend items</div>
        ) : (
          items.map((item) => (
            <div key={item.id || item.label} className={styles.item}>
              <div className={styles.left}>
                {item.icon && (
                  <span
                    className={styles.icon}
                    style={{ color: item.color || "inherit" }}
                  >
                    {item.icon}
                  </span>
                )}
                <span className={styles.label}>{item.label}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Legend;

