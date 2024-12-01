export interface IAlert {
  show: boolean;
  title?: string;
  description?: string;
}

export interface ISummary {
  type: "prompt" | "result" | "default";
  prompt: string;
  finalPrompt: string;
  result: string;
}

export interface IAIData {
  type: "prompt" | "result" | "default";
  content: string;
  contentType: "document" | "text";
  base64?: string;
  mimeType?: string;
}

export interface IAIPrompt {
  data: Array<IAIData>;
}
