import React, { createContext, useState, useContext, ReactNode } from "react";

// Define types for the alert message structure
interface AlertMessage {
  show: boolean;
  title?: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
}

// Create context with default value
const AlertMessageContext = createContext<{
  alertMessage: AlertMessage;
  setAlertMessage: React.Dispatch<React.SetStateAction<AlertMessage>>;
}>({
  alertMessage: { show: false, title: "", description: "", type: "info" },
  setAlertMessage: () => {},
});

interface AlertProviderProps {
  children: ReactNode;
}

// Create a provider to manage the alert message state
export const AlertMessageProvider: React.FC<AlertProviderProps> = ({
  children,
}) => {
  const [alertMessage, setAlertMessage] = useState<AlertMessage>({
    show: false,
    title: "",
    description: "",
    type: "info",
  });

  return (
    <AlertMessageContext.Provider value={{ alertMessage, setAlertMessage }}>
      {children}
    </AlertMessageContext.Provider>
  );
};

// Custom hook to access the alert context
export const useAlertMessage = () => useContext(AlertMessageContext);
