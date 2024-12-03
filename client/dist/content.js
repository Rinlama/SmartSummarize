extractPDFText();

function extractPDFText() {
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.action === "extractText") {
        try {
          // Extract text from an HTML page
          const articleText = document.body.innerText || "No content found";
          sendResponse({ type: "WebPage", text: articleText });
        } catch (error) {
          sendResponse({ error: error.message });
        }
      }
    },
  );
}
