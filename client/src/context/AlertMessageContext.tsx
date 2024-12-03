import React, { createContext, useState, useContext, ReactNode } from "react";

// Define types for the alert message structure
export interface IAlertMessage {
  show: boolean;
  title?: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
  position?: "top" | "bottom";
}

// Create context with default value
const AlertMessageContext = createContext<{
  alertMessage: IAlertMessage;
  setAlertMessage: React.Dispatch<React.SetStateAction<IAlertMessage>>;
}>({
  alertMessage: {
    show: false,
    title: "",
    description: "",
    type: "info",
    position: "bottom",
  },
  setAlertMessage: () => {},
});

interface AlertProviderProps {
  children: ReactNode;
}

// Create a provider to manage the alert message state
export const AlertMessageProvider: React.FC<AlertProviderProps> = ({
  children,
}) => {
  const [alertMessage, setAlertMessage] = useState<IAlertMessage>({
    show: false,
    title: "",
    description: "",
    type: "info",
    position: "bottom",
  });

  return (
    <AlertMessageContext.Provider value={{ alertMessage, setAlertMessage }}>
      {children}
    </AlertMessageContext.Provider>
  );
};

// Custom hook to access the alert context
export const useAlertMessage = () => useContext(AlertMessageContext);
