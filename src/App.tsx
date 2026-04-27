import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultModal } from "./components/ResultModal";
import { Settings } from "./components/Settings";
import { History } from "./components/History";
import { t } from "./locales/i18n";
import "./App.css";

interface AppConfig {
  ai: {
    provider: string;
    api_key: string;
    endpoint: string;
    model: string;
  };
  hotkey: string;
  theme: string;
  lang: string;
}

interface HistoryEntry {
  id: number;
  timestamp: string;
  original: string;
  optimized: string;
}

interface UpdateInfo {
  current_version: string;
  latest_version: string;
  download_url: string;
  release_notes: string;
  has_update: boolean;
}

type View = "main" | "settings" | "history";

function App() {
  const [view, setView] = useState<View>("main");
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [optimizedText, setOptimizedText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");
  const [lang, setLang] = useState("en");
  const [hotkey, setHotkey] = useState("CmdOrCtrl+Shift+P");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [dismissedUpdate, setDismissedUpdate] = useState(false);

  useEffect(() => {
    const unlisten = listen("hotkey-triggered", async () => {
      console.log("Hotkey triggered!");
      await handleOptimize();
    });

    loadConfig();

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (view === "main") {
      loadConfig();
    }
  }, [view]);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const info = await invoke<UpdateInfo>("check_for_update");
      if (info.has_update && !dismissedUpdate) {
        setUpdateInfo(info);
      }
    } catch (e) {
      console.error("Failed to check for update:", e);
    }
  };

  const loadConfig = async () => {
    try {
      const config = await invoke<AppConfig>("read_config");
      setLang(config.lang || "en");
      setHotkey(config.hotkey || "CmdOrCtrl+Shift+P");
      await invoke("register_hotkey", { hotkey: config.hotkey });
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  };

  const handleOptimize = async () => {
    setIsLoading(true);
    setError("");

    try {
      const textToOptimize = inputText.trim() || await invoke<string>("get_clipboard_text");

      if (!textToOptimize || textToOptimize.trim() === "") {
        setError(t("pleaseEnterText", lang));
        setIsLoading(false);
        return;
      }

      setOriginalText(textToOptimize);

      const config = await invoke<AppConfig>("read_config");
      const { provider, api_key, endpoint, model } = config.ai;

      const prompt = await invoke<string>("build_optimize_prompt", { prompt: textToOptimize });

      let response: Response;
      let optimized: string = "";

      if (provider === "deepseek") {
        response = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model || "deepseek-chat",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        optimized = data.choices[0]?.message?.content || "";
      } else if (provider === "minimax") {
        response = await fetch(`${endpoint}/text/chatcompletion_v2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model || "MiniMax-Text-01",
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        optimized = data.choices?.[0]?.messages?.[0]?.text || "";
      } else {
        response = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        optimized = data.choices[0]?.message?.content || "";
      }

      await invoke("add_history_entry", { original: textToOptimize, optimized });

      setOptimizedText(optimized);
      setShowModal(true);
    } catch (e) {
      setError(`${t("optimizationFailed", lang)}: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await invoke("set_clipboard_text", { text: optimizedText });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOriginalText("");
    setOptimizedText("");
  };

  const handleMinimize = async () => {
    const window = getCurrentWindow();
    await window.hide();
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setInputText(entry.original);
    setOptimizedText(entry.optimized);
    setOriginalText(entry.original);
    setShowModal(true);
    setView("main");
  };

  return (
    <div className="app">
      {view === "settings" ? (
        <Settings onBack={() => setView("main")} />
      ) : view === "history" ? (
        <History onBack={() => setView("main")} onSelect={handleSelectHistory} lang={lang} />
      ) : (
        <div className="main-view">
          <header className="app-header">
            <h1>{t("appTitle", lang)}</h1>
            <div className="header-actions">
              <button className="history-btn" onClick={() => setView("history")}>
                {t("history", lang)}
              </button>
              <button className="settings-btn" onClick={() => setView("settings")}>
                {t("settings", lang)}
              </button>
              <button className="minimize-btn" onClick={handleMinimize}>
                {t("minimizeToTray", lang)}
              </button>
            </div>
          </header>

          {updateInfo && updateInfo.has_update && (
            <div className="update-banner">
              <span>
                {lang === "zh" ? "发现新版本" : "Update available"}: v{updateInfo.latest_version}
              </span>
              <div className="update-actions">
                <a href={updateInfo.download_url} target="_blank" rel="noopener noreferrer" className="update-download-btn">
                  {lang === "zh" ? "下载" : "Download"}
                </a>
                <button className="update-dismiss-btn" onClick={() => setDismissedUpdate(true)}>
                  ×
                </button>
              </div>
            </div>
          )}

          <main className="app-main">
            <div className="optimizer-container">
              <h2>{t("enterPrompt", lang)}</h2>
              <textarea
                className="prompt-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("pastePrompt", lang)}
                rows={6}
              />
              <button
                className="optimize-btn"
                onClick={handleOptimize}
                disabled={isLoading}
              >
                {isLoading ? t("optimizing", lang) : t("optimize", lang)}
              </button>
              {error && <div className="error-message">{error}</div>}
              <p className="hint">
                {t("orPress", lang)} <kbd>{hotkey.replace("CmdOrCtrl", "Cmd/Ctrl")}</kbd> {t("toUseClipboard", lang)}
              </p>
            </div>
          </main>
        </div>
      )}

      <ResultModal
        isOpen={showModal}
        originalText={originalText}
        optimizedText={optimizedText}
        onClose={handleCloseModal}
        onCopy={handleCopy}
        lang={lang}
      />
    </div>
  );
}

export default App;