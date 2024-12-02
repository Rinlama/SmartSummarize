import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAlertMessage } from "../../context/AlertMessageContext";
import { AlertCircle } from "lucide-react";

function AlertTemplate() {
  const { alertMessage, setAlertMessage } = useAlertMessage();

  if (!alertMessage.show) return null;

  const alertStyles = {
    top: "absolute top-0 right-0 w-full bg-white px-2",
    bottom: "absolute bottom-32 right-0 w-full bg-white px-2",
  };

  const handleClose = () =>
    setAlertMessage({
      show: false,
    });

  return (
    <div className={alertStyles[alertMessage.position || "top"]}>
      <Alert variant="destructive" onClose={handleClose}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{alertMessage.title}</AlertTitle>
        <AlertDescription>{alertMessage.description}</AlertDescription>
      </Alert>
    </div>
  );
}

export default AlertTemplate;
