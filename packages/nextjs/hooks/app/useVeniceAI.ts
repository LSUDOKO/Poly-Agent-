"use client";

import { useCallback, useState } from "react";
import { analyzeTransaction, getAIAssistantResponse } from "~~/services/api/venice";

export function useVeniceAI() {
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAssistant = useCallback(async (message: string, context?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIAssistantResponse(message, context);
      setResponse(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeTx = useCallback(async (txData: string, chainName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeTransaction(txData, chainName);
      setResponse(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse("");
    setError(null);
  }, []);

  return {
    response,
    isLoading,
    error,
    askAssistant,
    analyzeTx,
    clearResponse,
  };
}
