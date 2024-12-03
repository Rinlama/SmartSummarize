# Smart Summarize Chrome Extension

Welcome to **Smart Summarize**, a powerful Chrome extension designed to enhance your browsing experience by summarizing content and providing intelligent responses effortlessly. Whether you're reading articles, browsing through technical documentation, or working with code, Smart Summarize can help you save time and get more out of your web browsing.

## Key Features

### 1. **Web Page Summarization**
   - Generate concise summaries of the content on the current web page.
   - Quickly understand the key points without needing to read the entire page.

### 2. **File-Based Summarization**
   Smart Summarize supports summarizing content from various file types, including:

   - **PDFs** (`application/pdf`)
   - **JavaScript files** (`application/x-javascript`, `text/javascript`)
   - **Python files** (`application/x-python`, `text/x-python`)
   - **Plain text files** (`text/plain`)
   - **HTML documents** (`text/html`)
   - **CSS files** (`text/css`)
   - **Markdown files** (`text/md`)
   - **CSV files** (`text/csv`)
   - **XML files** (`text/xml`)
   - **RTF documents** (`text/rtf`)

### 3. **Custom Query Feature**
   A convenient checkbox lets users ask specific questions about the current webpage, such as:

   - **For articles**: Quickly inquire about the publication date, author, and other details.
   - **For platforms like Stack Overflow**: Extract information such as the question's author, post date, and more.

### 4. **Integrated AI Assistant**
   - Users can interact with a default LLM (1.5 Flash Google) to ask anything.
   - Get AI-driven insights, answers, or explanations on various topics with ease.

## Setup Instructions

### 1. **OAuth Client ID Configuration**
   To use the extension, you need to add the OAuth Client ID from your credentials in Google Cloud Gemeni API.

   - Make sure to add the **same Item ID** in the extension's manifest file to avoid errors.
   - If the item ID is incorrect, the extension will throw an error like:
     ```
     Service responded with error: 'bad client id: 15131531312312315315315315.apps.googleusercontent.com'
     ```

### 2. **Adding Summarization API and Prompt API**
   - Integrate the Summarization API and Prompt API for Chrome Extensions using [Chrome Origin Trials](https://developer.chrome.com/origintrials).
   - Ensure that your **Chrome extension ID** is the same as specified in the API configuration.

## Conclusion
Smart Summarize is a must-have tool for anyone who wants to streamline their web browsing and quickly access important content. Whether it's a webpage, a code snippet, or a document, Smart Summarize provides the tools you need to work smarter and faster.

For more information, visit the [official extension page](#).
