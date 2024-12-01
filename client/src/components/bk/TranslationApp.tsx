/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

declare const self: any;

const TranslationApp: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(""); // Input text from user
  const [detectedLanguage, setDetectedLanguage] = useState<string>(
    "not sure what language this is",
  ); // Detected language display
  const [confidence, setConfidence] = useState<number>(0); // Confidence percentage
  const [outputText, setOutputText] = useState<string>(""); // Translated text
  const [targetLanguage, setTargetLanguage] = useState<string>("en"); // Target language selection
  const [sourceLanguage, setSourceLanguage] = useState<string>(""); // Detected source language
  const [isTranslationSupported, setIsTranslationSupported] =
    useState<boolean>(true); // Checks if API support is available

  useEffect(() => {
    const initializeTranslation = async () => {
      if (!("translation" in self) || !("createDetector" in self.translation)) {
        setIsTranslationSupported(false);
        return;
      }
      console.log("Translation API is supported.");
    };

    initializeTranslation();
  }, []);

  // Handler to detect the language
  const runIt = async (text: string) => {
    console.log("Detecting language...");
    const detector = await self.translation.createDetector();
    if (!text.trim()) {
      setDetectedLanguage("not sure what language this is");
      setConfidence(0);
      return;
    }
    console.log(detector);
    const [detectionResult] = await detector.detect(text);
    console.log(detectionResult);
    const { detectedLanguage, confidence } = detectionResult;

    setSourceLanguage(detectedLanguage);
    setConfidence(confidence);
    setDetectedLanguage(
      `${(confidence * 100).toFixed(1)}% sure this is ${languageTagToHumanReadable(detectedLanguage, "en")}`,
    );
  };

  // Helper to convert language tags to human-readable strings
  const languageTagToHumanReadable = (
    languageTag: string,
    targetLanguage: string,
  ): string => {
    const displayNames = new Intl.DisplayNames([targetLanguage], {
      type: "language",
    });
    return displayNames.of(languageTag) || languageTag;
  };

  // Event handler for form submission
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!["en", "ja", "es"].includes(sourceLanguage)) {
      setOutputText(
        "Currently, only English ↔ Spanish and English ↔ Japanese are supported.",
      );
      return;
    }

    try {
      const translator = await self.translation.createTranslator({
        sourceLanguage,
        targetLanguage,
      });
      const translatedText = await translator.translate(inputValue.trim());
      setOutputText(translatedText);
    } catch (error) {
      setOutputText("An error occurred while translating. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      {!isTranslationSupported && (
        <div className="not-supported-message">
          Translation API is not supported in your environment.
        </div>
      )}
      <form onSubmit={handleFormSubmit}>
        {confidence}
        <textarea
          value={inputValue}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setInputValue(e.target.value);
            runIt(e.target.value);
          }}
          placeholder="Type text to detect language"
        />
        <div>
          <span>{detectedLanguage}</span>
        </div>
        <div>
          <select
            value={targetLanguage}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTargetLanguage(e.target.value)
            }
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
        <button type="submit">Translate</button>
      </form>

      <output>{outputText}</output>
    </div>
  );
};

export default TranslationApp;
