import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyzingOverlay from "../../components/UI/AnalyzingOverlay";
import styles from "./HomePage.module.css";

const points = [
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12l4 4 10-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "9 classes",
    text: "Caries, pulpitis, periodontitis, calculus, discoloration, more.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 7h16M4 12h10M4 17h6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Readable overlays",
    text: "White-and-blue UI with crisp masks for enamel, dentin, pulp.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3l8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Secure flow",
    text: "De-identified uploads and exportable reports for clinics.",
  },
];

const Tooth = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className={styles.tooth}>
    <defs>
      <linearGradient id="toothGrad" x1="16" x2="48" y1="8" y2="52">
        <stop stopColor="#e9f2ff" />
        <stop offset="1" stopColor="#2f7de5" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    <path
      d="M20 10c6-6 18-6 24 0 5 5 5 14 2 24-2 7-5 18-8 18-3 0-4-8-6-8s-3 8-6 8c-3 0-6-11-8-18-3-10-3-19 2-24z"
      fill="url(#toothGrad)"
      stroke="rgba(19,64,125,0.3)"
      strokeWidth="1.6"
    />
  </svg>
);

function HomePage() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileDataUrl(String(ev.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const startAnalysis = () => {
    if (!fileDataUrl) {
      setError("Choose an image first.");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate("/analysis", { state: { image: fileDataUrl, name: fileName } });
      setIsAnalyzing(false);
    }, 1400);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>AlphaDent</p>
          <h1 className={styles.title}>Dental analysis in Alpha blue.</h1>
          <p className={styles.lead}>
            Upload an intraoral image to preview segmentation overlays for nine
            pathology classes. Clean white-and-blue layout keeps findings
            obvious.
          </p>
          <div className={styles.heroActions}>
            <button
              className={styles.primary}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              Upload image
            </button>
            <button
              className={styles.secondary}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              View sample
            </button>
          </div>
        </div>
        <div className={styles.toothWrap}>
          <Tooth />
        </div>
      </section>

      <section className={styles.points}>
        {points.map((item) => (
          <div key={item.title} className={styles.point}>
            <div className={styles.pointIcon}>{item.icon}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.upload}>
        <div>
          <p className={styles.eyebrow}>Upload</p>
          <h2>Intraoral image</h2>
          <p className={styles.lead}>
            Choose a JPG or PNG. We generate overlays for nine pathology
            classes.
          </p>
        </div>
        <div className={styles.uploadControls}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={onFileSelect}
          />
          <button
            className={styles.secondary}
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            Choose image
          </button>
          <button
            className={styles.primary}
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>
          <span className={styles.fileNote}>
            {fileName || "No file selected yet"}
          </span>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </section>
      {isAnalyzing && <AnalyzingOverlay label="Analyzing..." />}
    </main>
  );
}

export default HomePage;
