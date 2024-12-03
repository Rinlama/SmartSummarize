# Smart Summarize Chrome Extension

**Smart Summarize** is a cutting-edge Chrome extension that brings efficiency and intelligence to your web browsing experience. Whether you're reading articles, analyzing code, or working with documents, Smart Summarize helps you save time and extract relevant information effortlessly.

## Key Features

### 1. **Web Page Summarization**
   - Generate concise summaries of the content on the current web page, saving you time and effort while browsing. Whether it’s an article, blog post, or news page, you’ll quickly get the essential points.

### 2. **File-Based Summarization**
   - Summarize text from a variety of file types:
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
   - Easily ask questions about the current webpage or content using a convenient checkbox. 
     - **For articles**: Quickly inquire about the publication date, author, and more.
     - **For platforms like Stack Overflow**: Extract details such as the author, post date, and more.

### 4. **Integrated AI Assistant**
   - Users can interact with a default **LLM (1.5 Flash Google)** to ask anything and get AI-driven insights, explanations, and answers on a wide range of topics.
   
### 5. **Authentication & Authorization**
   - The extension uses **Chrome Identity API** to authenticate users with Google OAuth2 credentials.
   - Token validation and user verification are handled through the backend, built on an **Express server**.

## Setup Instructions

### 1. **OAuth Client ID Configuration**
   - Add the OAuth Client ID from Google Cloud Gemeni API to the `manifest.json` of the Chrome extension.
   - Ensure the **Item ID** in the extension matches the one in the manifest, or you will get an error:
     ```
     Service responded with error: 'bad client id: 15131531312312315315315315.apps.googleusercontent.com'
     ```

### 2. **Integrate Summarization API & Prompt API**
   - Use the **Google Chrome AI APIs** for Summarization and Prompt APIs:  
     - [Summarize API](https://developer.chrome.com/docs/ai/summarizer-api)
     - [Prompt API](https://developer.chrome.com/docs/extensions/ai/prompt-api)
   - Also, integrate **Google Gemini API**:
     - [Prompt API](https://ai.google.dev/gemini-api/docs/text-generation?lang=node)
     - [Document Processing](https://ai.google.dev/gemini-api/docs/document-processing?lang=node)
   - Ensure that the **Chrome extension ID** is the same in the API configuration.

## Tech Stack

### Frontend:
   - **Google Chrome Extension** using **Google Chrome’s built-in AI models** (Gemini Nano).
   - **React**, **React Router**, **Shadcn**, **Tailwind**, **React Context** for efficient state management.

### Backend:
   - **Node.js** and **Express** for backend logic and handling API requests.
   - **Sequelize** for ORM and database management with MySQL.
   - **Google Gemini API** for AI-powered summarization and document processing.

## How to Start the Application

### Backend Setup (Express)
1. Create a `.env` file in the main folder by copying `env.example`.
2. Add MySQL credentials in the `.env` file.
3. If `FORCE_SYNC=true`, the server will automatically sync the database schema on every refresh.
4. Run the following commands:
   ```bash
   npm install
   npm start
