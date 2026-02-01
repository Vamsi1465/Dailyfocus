import { useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PiPWindow extends Window {
  close: () => void;
}

declare global {
  interface Window {
    documentPictureInPicture: {
      requestWindow(options?: { width?: number; height?: number }): Promise<PiPWindow>;
      window: PiPWindow | null;
      addEventListener(type: string, listener: EventListener): void;
    };
  }
}

export function usePiP() {
  const [pipWindow, setPipWindow] = useState<PiPWindow | null>(null);
  const [isSupported] = useState(() => 'documentPictureInPicture' in window);

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  const requestPiP = useCallback(async (width = 400, height = 300) => {
    if (!isSupported) {
      console.warn("Document Picture-in-Picture is not supported in this browser.");
      return;
    }

    // Reuse existing window if open
    if (pipWindow) {
      return;
    }

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width,
        height,
      });

      // 1. Copy all styles (link tags and style tags)
      // This is more robust than iterating document.styleSheets
      const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach((style) => {
        pip.document.head.appendChild(style.cloneNode(true));
      });

      // 2. Sync root element classes (essential for Tailwind dark mode selector)
      pip.document.documentElement.className = document.documentElement.className;
      
      // 3. Sync body classes if any
      pip.document.body.className = document.body.className;

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pip);
    } catch (e) {
      console.error("Failed to open PiP window:", e);
    }
  }, [isSupported, pipWindow]);

  const PiPContent = useCallback(({ children }: { children: ReactNode }) => {
    if (!pipWindow) return null;
    return createPortal(children, pipWindow.document.body);
  }, [pipWindow]);

  return {
    isSupported,
    pipWindow,
    requestPiP,
    closePiP,
    PiPContent
  };
}
