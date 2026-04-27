import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { t } from "../locales/i18n";

interface AIConfig {
  provider: string;
  api_key: string;
  endpoint: string;
  model: string;
}

interface AppConfig {
  ai: AIConfig;
  hotkey: string;
  theme: string;
  lang: string;
}

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (recording && inputRef.current) {
      inputRef.current.focus();
    }
  }, [recording]);

  const loadConfig = async () => {
    try {
      const cfg = await invoke<AppConfig>("read_config");
      setConfig(cfg);
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      await invoke("write_config", { config });
      setMessage(t("settingsSaved", config.lang));
      setTimeout(() => setMessage(""), 2000);
    } catch (e) {
      setMessage(`Failed: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config) return;
    setTesting(true);
    setTestResult(null);

    const { provider, api_key, endpoint, model } = config.ai;

    if (!api_key && provider !== "ollama") {
      setTestResult({ success: false, message: "API key is required" });
      setTesting(false);
      return;
    }

    const testPrompt = "Say 'OK' if you can hear me.";
    let success = false;
    let resultMessage = "";

    try {
      if (provider === "deepseek") {
        const response = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model || "deepseek-chat",
            messages: [{ role: "user", content: testPrompt }],
          }),
        });

        if (response.ok) {
          success = true;
          resultMessage = "Connection successful!";
        } else {
          resultMessage = `API error: ${response.status}`;
        }
      } else if (provider === "minimax") {
        const response = await fetch(`${endpoint}/text/chatcompletion_v2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model || "MiniMax-Text-01",
            messages: [{ role: "user", content: testPrompt }],
          }),
        });

        if (response.ok) {
          success = true;
          resultMessage = "Connection successful!";
        } else {
          resultMessage = `API error: ${response.status}`;
        }
      } else if (provider === "ollama") {
        const response = await fetch(`${endpoint}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model || "llama3",
            messages: [{ role: "user", content: testPrompt }],
          }),
        });

        if (response.ok) {
          success = true;
          resultMessage = "Connection successful!";
        } else {
          resultMessage = `API error: ${response.status}`;
        }
      } else {
        const response = await fetch(`${endpoint}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: testPrompt }],
          }),
        });

        if (response.ok) {
          success = true;
          resultMessage = "Connection successful!";
        } else {
          resultMessage = `API error: ${response.status}`;
        }
      }
    } catch (e) {
      resultMessage = `Connection failed: ${e}`;
    }

    setTestResult({ success, message: resultMessage });
    setTesting(false);
  };

  const updateAI = (field: keyof AIConfig, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      ai: { ...config.ai, [field]: value },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (!recording) return;

    const parts: string[] = [];
    if (e.metaKey || e.ctrlKey) parts.push("CmdOrCtrl");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");

    const key = e.key;
    if (key === "Control" || key === "Meta" || key === "Shift" || key === "Alt") {
      return;
    }

    if (parts.length === 0) return;

    let displayKey = key.toUpperCase();
    if (key === " ") displayKey = "Space";
    else if (key.length === 1) displayKey = key.toUpperCase();

    parts.push(displayKey);
    const hotkeyStr = parts.join("+");

    setConfig({ ...config!, hotkey: hotkeyStr });
    setRecording(false);
  };

  const startRecording = () => {
    setRecording(true);
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  if (!config) {
    return <div className="error">Failed to load configuration</div>;
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <button className="back-btn" onClick={onBack}>← {t("back", config.lang)}</button>
        <h1>{t("settings", config.lang)}</h1>
      </div>

      <section className="settings-section">
        <h2>{t("aiConfiguration", config.lang)}</h2>

        <div className="form-group">
          <label htmlFor="provider">{t("provider", config.lang)}</label>
          <select
            id="provider"
            value={config.ai.provider}
            onChange={(e) => updateAI("provider", e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="claude">Claude</option>
            <option value="deepseek">DeepSeek</option>
            <option value="minimax">MiniMax</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="api_key">{t("apiKey", config.lang)}</label>
          <input
            id="api_key"
            type="password"
            value={config.ai.api_key}
            onChange={(e) => updateAI("api_key", e.target.value)}
            placeholder={t("enterApiKey", config.lang)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endpoint">{t("endpoint", config.lang)}</label>
          <input
            id="endpoint"
            type="text"
            value={config.ai.endpoint}
            onChange={(e) => updateAI("endpoint", e.target.value)}
            placeholder={t("endpointPlaceholder", config.lang)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">{t("model", config.lang)}</label>
          <input
            id="model"
            type="text"
            value={config.ai.model}
            onChange={(e) => updateAI("model", e.target.value)}
            placeholder={t("modelPlaceholder", config.lang)}
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>{t("hotkey", config.lang)}</h2>
        <div className="form-group">
          <label>{t("globalShortcut", config.lang)}</label>
          <div className="hotkey-input-container">
            <input
              ref={inputRef}
              type="text"
              className={`hotkey-input ${recording ? "recording" : ""}`}
              value={recording ? t("pressKeys", config.lang) : config.hotkey}
              readOnly
              onClick={startRecording}
              onKeyDown={handleKeyDown}
            />
            {recording && (
              <button
                className="cancel-btn"
                onClick={() => setRecording(false)}
              >
                Cancel
              </button>
            )}
          </div>
          <small>{t("clickInputPressHotkey", config.lang)}</small>
        </div>
      </section>

      <section className="settings-section">
        <h2>{t("language", config.lang)}</h2>
        <div className="form-group">
          <label htmlFor="lang">{t("selectLanguage", config.lang)}</label>
          <select
            id="lang"
            value={config.lang}
            onChange={(e) => setConfig({ ...config, lang: e.target.value })}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </section>

      <div className="settings-actions">
        <button
          className="test-btn"
          onClick={testConnection}
          disabled={testing}
        >
          {testing ? t("testing", config.lang) : t("testConnection", config.lang)}
        </button>
        <button
          className="save-btn"
          onClick={saveConfig}
          disabled={saving}
        >
          {saving ? t("saving", config.lang) : t("saveSettings", config.lang)}
        </button>
        {message && <span className="message">{message}</span>}
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? "success" : "error"}`}>
          {testResult.message}
        </div>
      )}
    </div>
  );
}