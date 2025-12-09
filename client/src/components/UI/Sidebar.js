import React from "react";
import styles from "./Sidebar.module.css";

function Sidebar({ title = "Layers", items = [] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>{title}</div>
      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>No items</div>
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
                <span>{item.label}</span>
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

