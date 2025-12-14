import React from "react";
import Toast from "./Toast";
import styles from "./ToastContainer.module.css";

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}

export default ToastContainer;

