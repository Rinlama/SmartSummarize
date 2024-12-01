// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   SendHorizontal,
//   Settings,
//   Brain,
//   StopCircle,
//   Eraser,
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { useSummarizer } from "../../context/SummarizerContext";
// import { useAlertMessage } from "../../context/AlertMessageContext";
// import AlertTemplate from "../alert/AlertTemplate";
// import { IAIPrompt, ISummary } from "../../interface/main.interface";

// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Spinner } from "../ui/spinner";
// import { Button } from "../ui/button";
// import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

// declare const window: any;

// function Home() {
//   const [summary, setSummary] = useState<ISummary>({
//     type: "default",
//     finalPrompt: "",
//     prompt: "",
//     result: "",
//   });

//   const [aiDataList, setAIDataList] = useState<IAIPrompt>({ data: [] });
//   const [progress, setProgress] = useState<boolean>();

//   const summarizer = useSummarizer();
//   const { setAlertMessage } = useAlertMessage();

//   const accumulatedContentRef = useRef("");
//   const abortController = useRef<AbortController | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const extractWebText = () => {
//     (window as any).chrome.runtime.sendMessage({ action: "openSidebar" });
//     (window as any).chrome.tabs.query(
//       { active: true, currentWindow: true },
//       (tabs: any) => {
//         (window as any).chrome.tabs.sendMessage(
//           tabs[0].id,
//           { action: "extractText" },
//           (response: any) => {
//             if (response && response.text) {
//               console.log("response", response.text);
//               createSummarizer(response.text);
//             } else {
//               setAlertMessage(() => ({
//                 show: true,
//                 type: "warning",
//                 title: "Warning",
//                 description: "Failed to extract text from the current tab.",
//               }));
//             }
//           },
//         );
//       },
//     );
//   };

//   const createSummarizer = async (webText: string) => {
//     abortController.current = new AbortController();
//     if (!summarizer) {
//       setAlertMessage(() => ({
//         show: true,
//         type: "warning",
//         title: "Warning",
//         description: "Summarizer instance is unavailable.",
//       }));
//       return;
//     }

//     setProgress(true); // Indicate progress
//     try {
//       const stream = await summarizer.summarizeStreaming(webText, {
//         context: "This article is intended for a tech-savvy audience.",
//         signal: abortController.current.signal,
//       });

//       // Initialize state for the summarization process
//       setSummary({
//         type: "default",
//         finalPrompt: "",
//         result: "",
//         prompt: "",
//       });

//       setAIDataList((prevState: any) => ({
//         ...prevState,
//         data: [
//           ...(prevState?.data || []),
//           {
//             type: "prompt",
//             content: "Summarize current page by summarizeStreaming API",
//           },
//         ],
//       }));

//       let previousLength = 0;
//       accumulatedContentRef.current = ""; // Track accumulated content

//       // Process streaming data
//       for await (const segment of stream) {
//         const newContent = segment.slice(previousLength);
//         accumulatedContentRef.current += newContent;

//         setSummary((prev) => ({
//           ...prev,
//           type: "result",
//           result: prev.result + newContent,
//         }));

//         previousLength = segment.length;

//         // Ensure the latest summary is visible
//         if (messagesEndRef.current) {
//           messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//       }

//       // Finalize the streaming result
//       setAIDataList((prevState: any) => ({
//         ...prevState,
//         data: [
//           ...(prevState?.data || []),
//           {
//             type: "result",
//             content: accumulatedContentRef.current,
//           },
//         ],
//       }));

//       setSummary({
//         finalPrompt: "",
//         type: "default",
//         prompt: "",
//         result: "",
//       });

//       setProgress(false); // Reset progress indicator
//     } catch (error: any) {
//       // Handle aborted request
//       if (error.name === "AbortError") {
//         console.log("Streaming aborted by the user.");
//         setSummary({
//           finalPrompt: "",
//           type: "default",
//           prompt: "",
//           result: "",
//         });
//         setAIDataList((prevState: any) => ({
//           ...prevState,
//           data: [
//             ...(prevState?.data || []),
//             {
//               type: "result",
//               content: accumulatedContentRef.current,
//             },
//           ],
//         }));
//         return;
//       }

//       // Handle other errors
//       setAlertMessage(() => ({
//         show: true,
//         type: "error",
//         title: "Error",
//         description: `Failed to complete summarization: ${error.message || error}`,
//       }));

//       setProgress(false);
//     }
//   };

//   const createPrompt = async () => {
//     abortController.current = new AbortController();
//     setProgress(true);
//     try {
//       const capabilities = await (
//         window as any
//       ).chrome.aiOriginTrial.languageModel.capabilities();

//       const initialPrompts = [
//         {
//           role: "system",
//           content: "You are a helpful and friendly assistant.",
//         },
//       ];

//       const updatedPrompts = [
//         ...initialPrompts,
//         ...(aiDataList?.data?.map((d: any) => {
//           if (d.type === "prompt") {
//             return { role: "user", content: d.content };
//           } else {
//             return { role: "assistant", content: d.content };
//           }
//         }) || []),
//       ];

//       setAIDataList((prevState: any) => {
//         return {
//           ...prevState,
//           data: [
//             ...(prevState?.data || []),
//             {
//               type: "prompt",
//               content: summary.prompt,
//             },
//           ],
//         };
//       });

//       const session = await (
//         window as any
//       ).chrome.aiOriginTrial.languageModel.create({
//         temperature: Math.max(capabilities.defaultTemperature * 1.2, 2.0),
//         topK: capabilities.defaultTopK,
//         initialPrompts: updatedPrompts,
//         maxTokens: 10,
//         signal: abortController.current.signal,
//       });

//       // Stream the response for the provided prompt
//       const stream = session.promptStreaming(summary.prompt);
//       //make empty input as summary
//       setSummary((prev) => {
//         return {
//           ...prev,
//           type: "default",
//           prompt: "",
//         };
//       });

//       let previousChunk = "";

//       let isStreamCompleted = false;
//       accumulatedContentRef.current = "";
//       for await (const chunk of stream) {
//         const newChunk = chunk.startsWith(previousChunk)
//           ? chunk.slice(previousChunk.length)
//           : chunk;
//         accumulatedContentRef.current += newChunk;
//         previousChunk = chunk;

//         setSummary((prev) => {
//           return {
//             ...prev,
//             type: "result",
//             result: accumulatedContentRef.current,
//           };
//         });
//         if (messagesEndRef.current) {
//           messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//       }

//       isStreamCompleted = true;

//       // Handle completion logic
//       if (isStreamCompleted) {
//         setAIDataList((prevState: any) => {
//           return {
//             ...prevState,
//             data: [
//               ...(prevState?.data || []),
//               {
//                 type: "result",
//                 content: accumulatedContentRef.current,
//               },
//             ],
//           };
//         });
//         //clearn up the summary
//         setSummary((pre) => ({ ...pre, type: "default" }));
//       }
//       setProgress(false);
//     } catch (error: any) {
//       setAlertMessage(() => ({
//         show: true,
//         type: "error",
//         title: "Error",
//         description: "Chrome Extension is needed to run this feature. " + error,
//       }));

//       //clearn up the summary
//       setSummary({
//         finalPrompt: "",
//         type: "prompt",
//         prompt: "",
//         result: "",
//       });
//       setProgress(false);
//     }
//   };

//   const handleKeyDown = (event: any) => {
//     if (event.key === "Enter") {
//       submitPrompt();
//       // Perform your action here
//     }
//   };
//   const submitPrompt = () => {
//     // createSummarizer();
//     if (progress || !summary.prompt) {
//       return;
//     }
//     createPrompt();
//   };

//   useEffect(() => {
//     return () => {
//       if (abortController.current) {
//         abortController.current.abort();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     console.log("aiDataList", aiDataList);
//   }, [aiDataList]);

//   return (
//     <div>
//       <div className="m-2">
//         <div className="bg-custom-light-blue h-[85vh]">
//           <div className="flex justify-between p-5">
//             <div>
//               <p className="font-sans text-lg">Web AI Assitant</p>
//               <p className="text-sm text-gray-700">Google Gemini API</p>
//             </div>
//             <div>
//               <Settings className="cursor-pointer" />
//             </div>
//           </div>

//           {/* chat */}
//           <div className="h-[75vh] w-full my-5 pb-20 text-sm overflow-y-auto scrollbar-thin">
//             {aiDataList?.data.map((prompt, i) => {
//               if (prompt.type === "prompt") {
//                 return (
//                   <div
//                     key={i}
//                     className="h-max w-full flex justify-end py-2 px-3"
//                   >
//                     <p className="bg-blue-500 p-2 text-white max-w-[80%]">
//                       {prompt.content}
//                     </p>
//                   </div>
//                 );
//               } else if (prompt.type === "result") {
//                 return (
//                   <div key={i} className="h-max w-full flex">
//                     <div className="p-3">
//                       <Brain />
//                     </div>
//                     <div className="flex flex-row">
//                       <ReactMarkdown
//                         className="bg-white p-2 max-w-[80%]"
//                         children={prompt.content}
//                         remarkPlugins={[remarkGfm]}
//                       />
//                     </div>
//                   </div>
//                 );
//               }
//             })}

//             <>
//               {summary.type === "prompt" ? (
//                 <div className="h-max w-full flex justify-end py-2 px-3">
//                   <p className="bg-blue-500 p-2 text-white max-w-[80%]">
//                     {summary.finalPrompt}
//                   </p>
//                 </div>
//               ) : summary.type === "result" ? (
//                 <div className="h-max w-full flex">
//                   <div className="p-3">
//                     <Brain />
//                   </div>
//                   <div className="flex flex-row">
//                     <ReactMarkdown
//                       className="bg-white p-2 max-w-[80%]"
//                       children={summary.result}
//                       remarkPlugins={[remarkGfm]}
//                     />
//                   </div>
//                 </div>
//               ) : null}
//             </>
//             <div ref={messagesEndRef} />
//             <AlertTemplate />
//           </div>
//         </div>

//         <div className="my-1">
//           <Badge
//             className="hover:cursor-pointer hover:bg-blue-500 hover:text-white"
//             onClick={() => extractWebText()}
//             variant="outline"
//           >
//             Summarize-web-text
//           </Badge>
//         </div>
//         <div className="chat">
//           <div className="chat flex relative">
//             <div className="relative w-full">
//               <Input
//                 className="h-[50px] text-sm pr-[40px]"
//                 placeholder="Enter your question here"
//                 value={summary.prompt}
//                 onChange={(e) =>
//                   setSummary({ ...summary, prompt: e.target.value })
//                 }
//                 onKeyDown={handleKeyDown}
//               />

//               {progress ? (
//                 <div className="items-center  flex absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer">
//                   <Spinner className="" />

//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Button
//                         variant="destructive"
//                         size="icon"
//                         onClick={() => {
//                           abortController.current?.abort();
//                           setProgress(false);
//                         }}
//                       >
//                         <StopCircle />
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Stop</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//               ) : (
//                 <div className="flex items-center absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 cursor-pointer">
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         disabled={progress || !summary.prompt}
//                       >
//                         <SendHorizontal
//                           className="mx-2"
//                           onClick={submitPrompt}
//                           size={25}
//                         />
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Send Prompt</p>
//                     </TooltipContent>
//                   </Tooltip>

//                   {aiDataList && aiDataList?.data.length > 0 && (
//                     <Tooltip>
//                       <TooltipTrigger>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => {
//                             abortController.current?.abort();
//                             setAIDataList({
//                               data: [],
//                             });

//                             setProgress(false);
//                           }}
//                         >
//                           <Eraser />
//                         </Button>
//                       </TooltipTrigger>
//                       <TooltipContent>
//                         <p>Erase current page</p>
//                       </TooltipContent>
//                     </Tooltip>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;
