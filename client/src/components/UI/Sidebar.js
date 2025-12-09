import React from "react";
import styles from "./Sidebar.module.css";

function Sidebar({ title = "Layers", items = [], collapsed = false }) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      aria-hidden={collapsed}
    >
      <div className={styles.header}>{title}</div>
      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>No items</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id || item.label}
              className={styles.item}
              style={{
                borderLeftColor: item.color || "#323232",
                color: item.color ? undefined : "#e5e5e5",
              }}
            >
              <div className={styles.left}>
                {item.icon && (
                  <span
                    className={styles.icon}
                    style={{ color: item.color || "inherit" }}
                  >
                    {item.icon}
                  </span>
                )}
                <div className={styles.textBlock}>
                  <span className={styles.title}>{item.label}</span>
                  {item.description && (
                    <span className={styles.description}>{item.description}</span>
                  )}
                </div>
              </div>
              {item.meta && <small>{item.meta}</small>}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

