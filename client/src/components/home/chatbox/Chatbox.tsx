/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal, Brain, StopCircle, Eraser } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "@/layout/Header";
import axios from "axios";
import { convertFileToBase64 } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { IAIPrompt, ISummary } from "@/interface/main.interface";
import { useSummarizer } from "@/context/SummarizerContext";
import { useAlertMessage } from "@/context/AlertMessageContext";
import { DisplayDocument } from "../document/Document";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function Chatbox() {
  const [summary, setSummary] = useState<ISummary>({
    type: "default",
    finalPrompt: "",
    prompt: "",
    result: "",
  });

  const { user } = useAuth();

  const [aiDataList, setAIDataList] = useState<IAIPrompt>({ data: [] });
  const [progress, setProgress] = useState<boolean>();
  const summarizer = useSummarizer();

  const { setAlertMessage } = useAlertMessage();

  const accumulatedContentRef = useRef("");

  const abortController = useRef<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const uploadRef = useRef<HTMLInputElement>(null);

  const [readWebText, setReadWebText] = useState<boolean>(false);

  useEffect(() => {
    runScript();
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const runScript = () => {
    (window as any).chrome.runtime.sendMessage(
      { action: "runScript" },
      function () {
        // Callback function to handle the response
        if ((window as any).chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            (window as any).chrome.runtime.lastError
          );
          return;
        }
        console.log("Message sent successfully");
      }
    );
  };

  const handleFileChange = async (e: any) => {
    const uploadedFile = e.target.files[0];

    // Allowed MIME types
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/html",
      "text/css",
      "application/javascript",
      "text/markdown",
      "text/csv",
      "text/xml",
      "text/rtf",
      "image/jpeg", // JPEG images
      "image/png", // PNG images
      "image/gif", // GIF images
      "image/svg+xml", // SVG images
      "image/webp", // WebP images
      "image/bmp", // BMP images
      "image/tiff", // TIFF images
      "image/x-icon", // Icon files
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      setAlertMessage({
        show: true,
        type: "error",
        title: "Error",
        description: "Invalid file type. Please upload a valid file type.",
      });
      return;
    }

    if (uploadedFile.length === 0) {
      setAlertMessage({
        show: true,
        type: "error",
        title: "Error",
        description: "No file selected",
      });
      return;
    }
    const base64 = await convertFileToBase64(uploadedFile);
    setAIDataList((prevState: any) => ({
      ...prevState,
      data: [
        ...(prevState?.data || []),
        {
          type: "prompt",
          content: "Summarize upload file " + uploadedFile.name,
          base64: base64,
          contentType: "document",
          mimeType: uploadedFile.type,
        },
      ],
    }));
    scrollToBottom();

    setProgress(true);

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("files", uploadedFile);
    try {
      // Send the FormData object to the server using Axios
      const { data } = await axios.post(
        "http://localhost:3000/api/protected/generativeai/process-files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file upload
            Authorization: `Bearer ${user?.ssToken}`,
          },
        }
      );
      setAIDataList((prevState: any) => ({
        ...prevState,
        data: [
          ...(prevState?.data || []),
          {
            type: "result",
            content: data.response,
          },
        ],
      }));
      scrollToBottom();
      setProgress(false);
    } catch (error: any) {
      setAlertMessage({
        show: true,
        type: "error",
        title: "Error",
        description: error?.Message,
      });
      setProgress(false);
    }
  };

  const extractWebText = (fromAction?: boolean) => {
    (window as any).chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs: any) => {
        (window as any).chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "extractText" },
          (response: any) => {
            if (response && response.text) {
              if (fromAction) {
                createSummarizer(response.text);
                return;
              }
              if (readWebText) {
                createPrompt(response.text);
              } else {
                createSummarizer(response.text);
              }
            } else {
              setAlertMessage(() => ({
                show: true,
                type: "warning",
                title: "Warning",
                description:
                  "Failed to extract text from the current tab." +
                  JSON.stringify(response),
              }));
            }
          }
        );
      }
    );
  };

  const createSummarizer = async (webText: string) => {
    abortController.current = new AbortController();
    if (!summarizer) {
      setAlertMessage(() => ({
        show: true,
        type: "warning",
        title: "Warning",
        description: "Summarizer instance is unavailable.",
      }));
      return;
    }

    setProgress(true); // Indicate progress
    try {
      const stream = await summarizer.summarizeStreaming(webText, {
        context: "",
        signal: abortController.current.signal,
      });

      // Initialize state for the summarization process
      setSummary({
        type: "default",
        finalPrompt: "",
        result: "",
        prompt: "",
      });

      setAIDataList((prevState: any) => ({
        ...prevState,
        data: [
          ...(prevState?.data || []),
          {
            type: "prompt",
            content: `Summarize web text in short: ${webText}`,
            contentType: "text",
          },
        ],
      }));

      let previousLength = 0;
      accumulatedContentRef.current = ""; // Track accumulated content

      // Process streaming data
      for await (const segment of stream) {
        const newContent = segment.slice(previousLength);
        accumulatedContentRef.current += newContent;

        setSummary((prev) => ({
          ...prev,
          type: "result",
          result: prev.result + newContent,
        }));

        previousLength = segment.length;

        // Ensure the latest summary is visible
        scrollToBottom();
      }

      // Finalize the streaming result
      setAIDataList((prevState: any) => ({
        ...prevState,
        data: [
          ...(prevState?.data || []),
          {
            type: "result",
            content: accumulatedContentRef.current,
          },
        ],
      }));

      setSummary({
        finalPrompt: "",
        type: "default",
        prompt: "",
        result: "",
      });

      setProgress(false); // Reset progress indicator
    } catch (error: any) {
      // Handle aborted request
      if (error.name === "AbortError") {
        console.log("Streaming aborted by the user.");
        setSummary({
          finalPrompt: "",
          type: "default",
          prompt: "",
          result: "",
        });
        setAIDataList((prevState: any) => ({
          ...prevState,
          data: [
            ...(prevState?.data || []),
            {
              type: "result",
              content: accumulatedContentRef.current,
            },
          ],
        }));
        return;
      }

      // Handle other errors
      setAlertMessage(() => ({
        show: true,
        type: "error",
        title: "Error",
        description: `Failed to complete summarization: ${
          error.message || error
        }`,
      }));

      setProgress(false);
    }
  };

  const chromePrompt = async (updatedPrompts: Array<any>) => {
    if (!abortController.current) {
      return;
    }
    const capabilities = await (
      window as any
    ).chrome.aiOriginTrial.languageModel.capabilities();
    const session = await (
      window as any
    ).chrome.aiOriginTrial.languageModel.create({
      temperature: Math.max(capabilities.defaultTemperature * 1, 1.5),
      topK: capabilities.defaultTopK,
      initialPrompts: updatedPrompts,
      signal: abortController.current.signal,
    });

    // Stream the response for the provided prompt
    const stream = session.promptStreaming(summary.prompt);
    //make empty input as summary
    setSummary((prev) => {
      return {
        ...prev,
        type: "default",
        prompt: "",
      };
    });

    let previousChunk = "";

    let isStreamCompleted = false;
    accumulatedContentRef.current = "";
    for await (const chunk of stream) {
      const newChunk = chunk.startsWith(previousChunk)
        ? chunk.slice(previousChunk.length)
        : chunk;
      accumulatedContentRef.current += newChunk;
      previousChunk = chunk;

      setSummary((prev) => {
        return {
          ...prev,
          type: "result",
          result: accumulatedContentRef.current,
        };
      });
      scrollToBottom();
    }

    isStreamCompleted = true;

    // Handle completion logic
    if (isStreamCompleted) {
      setAIDataList((prevState: any) => {
        return {
          ...prevState,
          data: [
            ...(prevState?.data || []),
            {
              type: "result",
              content: accumulatedContentRef.current,
            },
          ],
        };
      });
      //clean up the summary
      setSummary((pre) => ({ ...pre, type: "default" }));
    }
  };

  const createPrompt = async (webText?: string) => {
    abortController.current = new AbortController();
    setProgress(true);
    try {
      const initialPrompts = [
        {
          role: "system",
          content:
            "You are a helpful, friendly assistant and complete the sentences.",
        },
      ];

      const updatedChromePrompts = [
        ...initialPrompts,
        ...(aiDataList?.data?.map((d: any) => {
          if (d.type === "prompt") {
            return { role: "user", content: d.content };
          } else {
            return { role: "assistant", content: d.content };
          }
        }) || []),
      ];

      const updatedCustomPrompts = [
        ...(aiDataList?.data?.map((d) => {
          if (d.type === "prompt") {
            return { role: "user", parts: [{ text: d.content }] };
          } else {
            return { role: "model", parts: [{ text: d.content }] };
          }
        }) || []),
      ];
      if (webText) {
        updatedChromePrompts.push({
          role: "user",
          content: `Here is the web text you need to read: ${webText}`,
        });

        updatedCustomPrompts.push({
          role: "user",
          parts: [
            {
              text: `Here is the web text you need to read: ${webText}`,
            },
          ],
        });
      }

      console.log(updatedChromePrompts);

      setAIDataList((prevState: any) => {
        const newContent = {
          type: "prompt",
          content: summary.prompt,
          contentType: "text",
        };
        return {
          ...prevState,
          data: [...(prevState?.data || []), newContent],
        };
      });

      if (import.meta.env.VITE_CHROME_AI_PROMPT === "true") {
        chromePrompt(updatedChromePrompts);
      } else {
        await createCustomPromptStream(updatedCustomPrompts);
      }
      setProgress(false);
    } catch (error: any) {
      setAlertMessage(() => ({
        show: true,
        type: "error",
        title: "Error",
        description: error.message,
      }));

      //clearn up the summary
      setSummary({
        finalPrompt: "",
        type: "prompt",
        prompt: "",
        result: "",
      });
      setProgress(false);
    }
  };

  const createCustomPromptStream = async (updatedCustomPrompts: Array<any>) => {
    if (!abortController.current) {
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/protected/generativeai/generate-content-stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.ssToken}`,
        },
        body: JSON.stringify({
          prompt: summary.prompt,
          history: updatedCustomPrompts,
        }),
        signal: abortController.current.signal,
      }
    );

    // Check if the response is OK
    if (!response.ok) {
      // Attempt to parse error details from the response
      const errorDetails = await response.json().catch(() => null); // Gracefully handle invalid JSON
      const errorMessage =
        errorDetails?.error ||
        errorDetails?.message ||
        "Failed to generate content";
      throw new Error(`Error: ${errorMessage} (status: ${response.status})`);
    }
    if (response.body == null) {
      throw new Error("Response body is null");
    }

    setSummary((prev) => {
      return {
        ...prev,
        type: "default",
        prompt: "",
      };
    });

    let isStreamCompleted = false;
    accumulatedContentRef.current = "";

    // Get a reader for the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    // Use the reader to read chunks of data as they arrive
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      // Decode the chunk and append it to the content stream
      const chunkText = decoder.decode(value, { stream: true });
      accumulatedContentRef.current += chunkText;
      scrollToBottom();
      setSummary((prev) => {
        return {
          ...prev,
          type: "result",
          result: accumulatedContentRef.current,
        };
      });
    }

    isStreamCompleted = true;

    // Handle completion logic
    if (isStreamCompleted) {
      setAIDataList((prevState: any) => {
        return {
          ...prevState,
          data: [
            ...(prevState?.data || []),
            {
              type: "result",
              content: accumulatedContentRef.current,
            },
          ],
        };
      });
      //clean up the summary
      setSummary((pre) => ({ ...pre, type: "default" }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      submitPrompt();
    }
  };

  const submitPrompt = () => {
    if (progress && !summary.prompt) return;
    if (readWebText) {
      extractWebText();
    } else {
      createPrompt();
    }
  };

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <div className="bg-custom-light-blue h-[85vh]">
        <div className="h-[75vh] w-full pb-20 text-sm overflow-y-auto scrollbar-thin">
          <Header />
          <div className="pt-14">
            {aiDataList?.data.map((prompt, i) => {
              if (prompt.type === "prompt" && prompt.contentType === "text") {
                return (
                  <div
                    key={i}
                    className="h-max w-full flex justify-end py-2 px-3"
                  >
                    <p className="bg-blue-500 p-2 text-white max-w-[80%] max-h-40  w-60 overflow-scroll">
                      {prompt.content}
                    </p>
                  </div>
                );
              } else if (
                prompt.type === "prompt" &&
                prompt?.contentType === "document"
              ) {
                return (
                  <div
                    key={i}
                    className="h-max w-full flex justify-end flex-col items-end py-2 px-3"
                  >
                    <p className="bg-blue-500 p-2 text-white max-w-[80%] mb-2">
                      {prompt.content}
                    </p>
                    {DisplayDocument(prompt, setAlertMessage)}
                  </div>
                );
              } else if (prompt.type === "result") {
                return (
                  <div key={i} className="h-max w-full flex">
                    <div className="p-3">
                      <Brain />
                    </div>
                    <div className="flex flex-row">
                      <ReactMarkdown
                        className="bg-white p-2 max-w-[80%]"
                        children={prompt.content}
                        remarkPlugins={[remarkGfm]}
                      />
                    </div>
                  </div>
                );
              }
            })}

            {summary.type === "prompt" ? (
              <div className="h-max w-full flex justify-end py-2 px-3">
                <p className="bg-blue-500 p-2 text-white max-w-[80%]">
                  {summary.finalPrompt}
                </p>
              </div>
            ) : summary.type === "result" ? (
              <div className="h-max w-full flex">
                <div className="p-3">
                  <Brain />
                </div>
                <div className="flex flex-row">
                  <ReactMarkdown
                    className="bg-white p-2 max-w-[80%]"
                    children={summary.result}
                    remarkPlugins={[remarkGfm]}
                  />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="px-2">
        <div className="my-1">
          <Badge
            className="mr-2 hover:cursor-pointer hover:bg-blue-500 hover:text-white"
            onClick={() => {
              setReadWebText(false);
              extractWebText(true);
            }}
            variant="outline"
          >
            Summarize-web-text
          </Badge>
          <Badge
            className="mr-2 hover:cursor-pointer hover:bg-blue-500 hover:text-white"
            onClick={() => {
              setReadWebText(false);
              uploadRef.current?.click();
            }}
            variant="outline"
          >
            Summarize-as-document
          </Badge>

          <input
            ref={uploadRef}
            hidden
            type="file"
            onChange={handleFileChange}
          />
        </div>
        <div className="chat">
          <div className="chat flex relative flex-col">
            <div className="relative w-full">
              <Input
                className={`h-[50px] text-sm ${
                  aiDataList?.data?.length > 0 ? "pr-[110px]" : "pr-[50px]"
                }`}
                placeholder="Enter your question here"
                value={summary.prompt}
                onChange={(e) =>
                  setSummary({ ...summary, prompt: e.target.value })
                }
                onKeyDown={handleKeyDown}
              />

              {progress ? (
                <div className="items-center  flex absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer">
                  <Spinner className="" />

                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          abortController.current?.abort();
                          setProgress(false);
                        }}
                      >
                        <StopCircle />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <div className="flex items-center absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={submitPrompt}
                        disabled={progress || !summary.prompt}
                      >
                        <SendHorizontal className="mx-2" size={25} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send Prompt</p>
                    </TooltipContent>
                  </Tooltip>

                  {aiDataList && aiDataList?.data.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          className="mx-2"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            abortController.current?.abort();
                            setAIDataList({
                              data: [],
                            });
                            setSummary({
                              finalPrompt: "",
                              type: "default",
                              prompt: "",
                              result: "",
                            });

                            setProgress(false);
                          }}
                        >
                          <Eraser />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Erase current page</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={readWebText}
                onCheckedChange={(e: any) => {
                  setReadWebText(e);
                }}
              />
              <label className="text-xs py-2">
                Read current web page and type your a question
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatbox;
