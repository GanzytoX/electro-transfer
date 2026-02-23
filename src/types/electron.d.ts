interface ElectronAPI {
  minimizeWindow: () => void;
  closeWindow: () => void;
  saveFile: (
    content: string,
  ) => Promise<{ success: boolean; filePath?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
