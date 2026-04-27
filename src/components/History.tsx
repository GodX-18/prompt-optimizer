import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "../locales/i18n";

interface HistoryEntry {
  id: number;
  timestamp: string;
  original: string;
  optimized: string;
}

interface HistoryProps {
  onBack: () => void;
  onSelect: (entry: HistoryEntry) => void;
  lang: string;
}

export function History({ onBack, onSelect, lang }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const history = await invoke<{ entries: HistoryEntry[] }>("load_history");
      setEntries(history.entries);
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await invoke("delete_history_entry", { id });
      setEntries(entries.filter(e => e.id !== id));
    } catch (e) {
      console.error("Failed to delete entry:", e);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear all history?")) return;
    try {
      await invoke("clear_history");
      setEntries([]);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  };

  const formatTime = (timestamp: string) => {
    const [secs] = timestamp.split(".");
    const date = new Date(parseInt(secs) * 1000);
    return date.toLocaleString();
  };

  const truncate = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + "...";
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history">
      <div className="history-header">
        <button className="back-btn" onClick={onBack}>← {t("back", lang)}</button>
        <h1>{t("optimizationHistory", lang)}</h1>
        {entries.length > 0 && (
          <button className="clear-btn" onClick={handleClear}>{t("clearAll", lang)}</button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">{t("noHistory", lang)}</div>
      ) : (
        <div className="history-list">
          {entries.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-item-header">
                <span className="history-time">{formatTime(entry.timestamp)}</span>
                <div className="history-actions">
                  <button className="use-btn" onClick={() => onSelect(entry)}>{t("use", lang)}</button>
                  <button className="delete-btn" onClick={() => handleDelete(entry.id)}>×</button>
                </div>
              </div>
              <div className="history-content">
                <div className="history-original">
                  <label>{t("original", lang)}:</label>
                  <p>{truncate(entry.original, 100)}</p>
                </div>
                <div className="history-optimized">
                  <label>{t("optimized", lang)}:</label>
                  <p>{truncate(entry.optimized, 100)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}