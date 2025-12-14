import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faBolt,
  faFileExport,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import AnalyzingOverlay from "../../components/UI/AnalyzingOverlay";
import { analyzeImage } from "../../services/api";
import toothImage from "../../assets/images/tooth.png";
import styles from "./HomePage.module.css";

const points = [
  {
    icon: faBrain,
    text: "AI-powered detection of 9 pathology classes",
  },
  {
    icon: faBolt,
    text: "Instant analysis with precise overlays",
  },
  {
    icon: faFileExport,
    text: "Export detailed CSV reports",
  },
  {
    icon: faShieldAlt,
    text: "Secure, de-identified processing",
  },
];


function HomePage() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleFile = (file) => {
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

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  const startAnalysis = async () => {
    if (!fileDataUrl) {
      setError("Choose an image first.");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    
    try {
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        try {
          const data = await analyzeImage(file);
          navigate("/analysis", { 
            state: { 
              image: fileDataUrl, 
              name: fileName,
              predictions: data.predictions || null,
            } 
          });
        } catch (apiError) {
          console.error("Analysis error:", apiError);
          navigate("/analysis", { 
            state: { 
              image: fileDataUrl, 
              name: fileName,
            } 
          });
        }
      } else {
        navigate("/analysis", { 
          state: { 
            image: fileDataUrl, 
            name: fileName,
          } 
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      navigate("/analysis", { 
        state: { 
          image: fileDataUrl, 
          name: fileName,
        } 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>AlphaDent</h1>
          <p className={styles.subtitle}>Advanced Dental Analysis Platform</p>
          <p className={styles.lead}>
            Upload an intraoral image to preview segmentation overlays for nine
            pathology classes. Clean white-and-blue layout keeps findings
            obvious.
          </p>
        </div>
        <div className={styles.toothWrap}>
          <img src={toothImage} alt="Tooth illustration" className={styles.tooth} />
        </div>
      </section>

      <section className={styles.points}>
        {points.map((item, index) => (
          <div key={index} className={styles.point}>
            <div className={styles.pointIcon}>
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <p className={styles.pointText}>{item.text}</p>
          </div>
        ))}
      </section>

      <section className={styles.upload}>
        <div className={styles.uploadContent}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={onFileSelect}
            />
            <div className={styles.dropZoneContent}>
              <p className={styles.dropZoneText}>
                {fileName || "Drag & drop an image here or click to browse"}
              </p>
              <button
                className={styles.browseButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                Browse files
              </button>
            </div>
          </div>
          <div className={styles.uploadActions}>
            <button
              className={styles.primary}
              onClick={startAnalysis}
              disabled={isAnalyzing || !fileDataUrl}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </section>
      {isAnalyzing && <AnalyzingOverlay label="Analyzing..." />}
    </main>
  );
}

export default HomePage;
