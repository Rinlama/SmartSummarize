/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAlertMessage } from "@/context/AlertMessageContext";
import { IAIData } from "@/interface/main.interface";

export const DisplayDocument = (
  prompt: IAIData,
  setAlertMessage: (alert: IAlertMessage) => void
) => {
  const decodeBase64 = (base64String?: string): string => {
    try {
      return base64String ? atob(base64String.split(",").pop() || "") : "";
    } catch (error) {
      setAlertMessage({
        show: true,
        type: "error",
        title: "Error",
        description: "Invalid Base64 string. " + error,
      });
      return "Error: Invalid Base64 string.";
    }
  };

  const renderPreformatted = (content: string) => (
    <pre className="bg-white h-40 w-60 overflow-scroll">{content}</pre>
  );

  switch (prompt.mimeType) {
    case "application/pdf":
      return (
        <embed
          src={`${prompt.base64}`}
          type="application/pdf"
          width="330"
          height="200"
        />
      );
    case "text/plain":
    case "text/html":
    case "text/css":
    case "text/md":
    case "text/csv":
    case "text/xml":
      return renderPreformatted(decodeBase64(prompt.base64));

    case "text/rtf":
      return <iframe src={`${prompt.base64}`} width="600" height="400" />;

    default:
      return (
        <img
          src={`${prompt.base64}`}
          alt="document"
          className="h-40 w-60 object-cover"
        />
      );
  }
};
