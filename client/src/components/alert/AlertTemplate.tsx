import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useAlertMessage } from "../../context/AlertMessageContext";
import { AlertCircle } from "lucide-react";

function AlertTemplate() {
  const { alertMessage, setAlertMessage } = useAlertMessage();

  if (!alertMessage.show) {
    return null;
  }

  return (
    <div className="absolute bottom-32 right-0 w-full bg-white px-2">
      <Alert
        variant="destructive"
        onClose={() =>
          setAlertMessage({
            show: false,
          })
        }
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{alertMessage.title}</AlertTitle>
        <AlertDescription>{alertMessage.description}</AlertDescription>
      </Alert>
    </div>
  );
}

export default AlertTemplate;
