import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAlertMessage } from "../../context/AlertMessageContext";
import { AlertCircle } from "lucide-react";

function AlertTemplate() {
  const { alertMessage, setAlertMessage } = useAlertMessage();

  // Return null if no alert is shown
  if (!alertMessage.show) return null;

  // Styles for alert positioning (top or bottom)
  const alertStyles = {
    top: "absolute top-0 right-0 w-full bg-white px-2",
    bottom: "absolute bottom-32 right-0 w-full bg-white px-2",
  };

  // Function to determine the variant based on alert type
  const getVariant = () => {
    switch (alertMessage.type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default"; // Default to info if no match
    }
  };

  // Close handler for the alert
  const handleClose = () => setAlertMessage({ show: false });

  return (
    <div className={alertStyles[alertMessage.position || "top"]}>
      <Alert variant={getVariant()} onClose={handleClose}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{alertMessage.title}</AlertTitle>
        <AlertDescription>{alertMessage.description}</AlertDescription>
      </Alert>
    </div>
  );
}

export default AlertTemplate;
