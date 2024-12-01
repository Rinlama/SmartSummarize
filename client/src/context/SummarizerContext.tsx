/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useAlertMessage } from "./AlertMessageContext";

// Define the type for the summarizer instance
interface Summarizer {
  // Replace 'any' with actual types if the Summarizer API has specific methods or properties
  create: (options: { monitor: (monitor: never) => void }) => Promise<never>;
  [key: string]: any;
}

// Define the context type
const SummarizerContext = createContext<Summarizer | null>(null);

// Define the provider's props
interface SummarizerProviderProps {
  children: ReactNode;
}

export const SummarizerProvider: React.FC<SummarizerProviderProps> = ({
  children,
}) => {
  const [summarizer, setSummarizer] = useState<Summarizer | null>(null);
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    const createSummarizer = async () => {
      try {
        if ("ai" in window && "summarizer" in (window as any).ai) {
          const instance = await (window as any).ai.summarizer.create({
            monitor(m: any) {
              m.addEventListener("downloadprogress", (e: any) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
          });
          setSummarizer(instance);
        } else {
          setAlertMessage({
            show: true,
            title: "Summarizer API Not Supported",
            description:
              "Please update to the latest version or visit https://developer.chrome.com/docs/ai/built-in-apis#summarizer_api",
            type: "info",
          });
        }
      } catch (error: any) {
        setAlertMessage({
          show: true,
          title: "Error",
          description: error,
          type: "info",
        });
      }
    };

    createSummarizer();
  }, []);

  return (
    <SummarizerContext.Provider value={summarizer}>
      {children}
    </SummarizerContext.Provider>
  );
};

export const useSummarizer = (): Summarizer | null => {
  return useContext(SummarizerContext);
};
