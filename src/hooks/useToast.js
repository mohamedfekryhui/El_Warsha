import { useState } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message, duration = 3000) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), duration);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast(`تم نسخ: ${text}`);
  };

  return { toastMessage, setToastMessage, showToast, copyToClipboard };
}
