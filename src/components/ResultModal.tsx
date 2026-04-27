import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { t } from "../locales/i18n";

interface ResultModalProps {
  isOpen: boolean;
  originalText: string;
  optimizedText: string;
  onClose: () => void;
  onCopy: () => void;
  lang: string;
}

export function ResultModal({
  isOpen,
  originalText,
  optimizedText,
  onClose,
  onCopy,
  lang,
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("optimizationResult", lang)}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="text-comparison">
            <div className="text-section">
              <h3>{t("original", lang)}</h3>
              <pre className="text-box">{originalText}</pre>
            </div>
            <div className="text-section">
              <h3>{t("optimized", lang)}</h3>
              <div className="text-box optimized markdown-body">
                <ReactMarkdown>{optimizedText}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? t("copied", lang) : t("copyOptimized", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}