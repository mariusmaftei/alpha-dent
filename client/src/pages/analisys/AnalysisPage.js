import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa";
import Sidebar from "../../components/UI/Sidebar";
import ToolMenu from "../../components/UI/ToolMenu";
import styles from "./AnalisysPage.module.css";

function AnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const image = state?.image;
  const name = state?.name;

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <Sidebar
          title="Legend"
          items={[
            {
              id: "0",
              label: "Abrasion",
              color: "#94a3b8",
              icon: <FaTooth />,
            },
            {
              id: "1",
              label: "Filling",
              color: "#f59e0b",
              icon: <FaTooth />,
            },
            {
              id: "2",
              label: "Crown",
              color: "#c084fc",
              icon: <FaTooth />,
            },
            {
              id: "3",
              label: "Caries Class 1",
              color: "#ef4444",
              icon: <FaTooth />,
            },
            {
              id: "4",
              label: "Caries Class 2",
              color: "#fb7185",
              icon: <FaTooth />,
            },
            {
              id: "5",
              label: "Caries Class 3",
              color: "#22d3ee",
              icon: <FaTooth />,
            },
            {
              id: "6",
              label: "Caries Class 4",
              color: "#38bdf8",
              icon: <FaTooth />,
            },
            {
              id: "7",
              label: "Caries Class 5",
              color: "#f97316",
              icon: <FaTooth />,
            },
            {
              id: "8",
              label: "Caries Class 6",
              color: "#10b981",
              icon: <FaTooth />,
            },
          ]}
        />

        <div className={styles.centerPane}>
          {image ? (
            <img
              src={image}
              alt={name || "Uploaded intraoral"}
              className={styles.fullImage}
            />
          ) : (
            <div className={styles.empty}>
              <p>No image provided. Please upload from the home page.</p>
              <button className={styles.primary} onClick={() => navigate("/")}>
                Go to upload
              </button>
            </div>
          )}
        </div>

        <ToolMenu
          title="Tools"
          actions={[
            { id: "zoom", label: "Zoom", meta: "Fit / 100%" },
            { id: "export", label: "Export overlay", meta: "PNG / JSON" },
          ]}
        />
      </div>
    </main>
  );
}

export default AnalysisPage;
