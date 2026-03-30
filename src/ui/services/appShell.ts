import { startTransition, useCallback, useEffect, useState } from "react";

import { sendMessage } from "../../shared/runtime";
import { AppShellPayload } from "../../shared/types";

export interface UiStatus {
  message: string;
  isError: boolean;
}

export function isExtensionContext(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
}

export async function fetchAppShellPayload() {
  return sendMessage("GET_APP_SHELL_DATA", {});
}

export function useAppShellQuery(mockData: AppShellPayload) {
  const [payload, setPayload] = useState<AppShellPayload | null>(null);
  const [status, setStatus] = useState<UiStatus>({
    message: "",
    isError: false,
  });

  const load = useCallback(
    async (options?: { clearStatusOnSuccess?: boolean }): Promise<boolean> => {
      const clearStatusOnSuccess = options?.clearStatusOnSuccess ?? true;

      if (!isExtensionContext()) {
        startTransition(() => {
          setPayload(mockData);
          if (clearStatusOnSuccess) {
            setStatus({ message: "", isError: false });
          }
        });
        return true;
      }

      const response = await fetchAppShellPayload();
      if (!response.ok || !response.data) {
        startTransition(() => {
          setStatus({
            message: response.error ?? "Failed to load app shell.",
            isError: true,
          });
        });
        return false;
      }

      const nextPayload = response.data;
      startTransition(() => {
        setPayload(nextPayload);
        if (clearStatusOnSuccess) {
          setStatus({ message: "", isError: false });
        }
      });
      return true;
    },
    [mockData]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    payload,
    setPayload,
    status,
    setStatus,
    load,
  };
}
