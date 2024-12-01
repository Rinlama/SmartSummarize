/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useAlertMessage } from "./AlertMessageContext";

// Define the type for the Prompter instance
interface Prompter {
  create: (options: { monitor: (monitor: never) => void }) => Promise<never>;
  [key: string]: any;
}

// Define the context type
interface PrompterContextType {
  prompter: Prompter | null;
  controller: AbortController | null;
}

// Create Context
const PrompterContext = createContext<PrompterContextType | null>(null);

// Define the provider's props
interface PrompterProviderProps {
  children: ReactNode;
}

export const PrompterProvider: React.FC<PrompterProviderProps> = ({
  children,
}) => {
  const [prompter, setPrompter] = useState<Prompter | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const { setAlertMessage } = useAlertMessage();

  useEffect(() => {
    const createPrompter = async () => {
      try {
        if (!(window as any).chrome?.aiOriginTrial?.languageModel) {
          throw new Error("AI Origin Trial is not available in this browser.");
        }

        const capabilities = await (
          window as any
        ).chrome.aiOriginTrial.languageModel.capabilities();

        const newController = new AbortController();
        setController(newController);

        const session = await (
          window as any
        ).chrome.aiOriginTrial.languageModel.create({
          temperature: Math.max(capabilities.defaultTemperature * 1.2, 2.0),
          topK: capabilities.defaultTopK,
          signal: newController.signal,
          initialPrompts: [
            {
              role: "system",
              content: "You are a helpful and friendly assistant.",
            },
            { role: "user", content: "What is the capital of Italy?" },
            { role: "assistant", content: "The capital of Italy is Rome." },
            { role: "user", content: "What language is spoken there?" },
            {
              role: "assistant",
              content: "The official language of Italy is Italian. [...]",
            },
          ],
        });

        setPrompter(session);
      } catch (error) {
        setAlertMessage({
          show: true,
          title: "Error",
          description: error instanceof Error ? error.message : String(error),
          type: "info",
        });
      }
    };

    createPrompter();

    // Cleanup function to abort the controller if the component unmounts
    return () => {
      controller?.abort();
    };
  }, [setAlertMessage]);

  return (
    <PrompterContext.Provider value={{ prompter, controller }}>
      {children}
    </PrompterContext.Provider>
  );
};

export const usePrompter = (): PrompterContextType | null => {
  return useContext(PrompterContext);
};
