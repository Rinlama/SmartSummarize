# Smart Summarize - Chrome Extension

**Smart Summarize** is a powerful Chrome extension designed to enhance your browsing experience by summarizing content and providing intelligent responses effortlessly.

---

## 🚀 Features

### 🔹 Web Page Summarization
- Generate concise summaries of the content on the current webpage.

### 🔹 File-Based Summarization
Summarize text from various supported file types:
- **PDFs**: `application/pdf`
- **JavaScript files**: `application/x-javascript`, `text/javascript`
- **Python files**: `application/x-python`, `text/x-python`
- **Plain text files**: `text/plain`
- **HTML documents**: `text/html`
- **CSS files**: `text/css`
- **Markdown files**: `text/md`
- **CSV files**: `text/csv`
- **XML files**: `text/xml`
- **RTF documents**: `text/rtf`

### 🔹 Custom Query Feature
- Ask specific questions about the current webpage with a convenient checkbox:
  - **For articles**: Extract details like publication date and author.
  - **For platforms like Stack Overflow**: Fetch the question's author, post date, and more.

### 🔹 Integrated AI Assistant
- Utilize the built-in LLM (1.5 Flash Google) to ask questions and receive AI-driven insights on various topics.

---

## 🔒 Authentication & Authorization

- Uses **Chrome Identity API** to authenticate users via Google OAuth2.
- Backend (Express) verifies Google ID tokens to ensure secure access.

---

## 🛠️ Tech Stack

### **Frontend**
- **Google Chrome Extension**: Using Google Chrome’s built-in AI models (Gemini Nano).
- **Libraries**:
  - React, React-Router-Dom, Shadcn, Tailwind, React-Context

### **Backend**
- Node.js, Express, Sequelize, Google Gemini API
Login : http://localhost:3000/api/auth/login 
(it post with token, so api validate token, if validated, then get the userinfo, then if user exist then it update user table, if not it create a new user on database and return user with jwt token which will send to React AuthContext )

- Required JWT token 
user/update : http://localhost:3000/api/protected/user/${user?.id} it validate the jwt tokena nd updates the Gemeni Key to the user table. 

- get/user/:id : http://localhost:3000/api/protected/user/${user?.id} it validate the jwt token and get user information with Genimi API Key

- process-files : http://localhost:3000/api/protected/generativeai/process-files
it takes multipart/form-data with files and express store the files in memory using multer them file buffer to string base64Data then get APIKey from user table then send to Gemeni model to generate content for documents 

- generate-content-stream : http://localhost:3000/api/protected/generativeai/generate-content-stream
it get prompt and history, then validate and get user from JWT Token, ready to send as stream, get Gemini API Key from user table. then utilize the startChat using Gemini Model and send the response as stream as chuck.
---

### How to Start the Application

##### **Chrome Extension Setup**
   - Add the OAuth Client ID from Google Console to the `manifest.json` of the Chrome extension.
   - Ensure the **Item ID** in the extension matches the one in the manifest, or you will get an error:
     ```
     Service responded with error: 'bad client id: 15131531312312315315315315.apps.googleusercontent.com'
     ```
   - Add trial_tokens to the manifest.json insde the client/dist/folder.
   - Make sure to enable Prompt API for Gemini Nano and  Summarization API for Gemini Nano in chrome://flags/
   - Chrome versiomn running in Chrome 131 to 136 for Chrome Canary 
   - Activate the trial for Summarization API and Prompt API for Chrome Extensions for https://developer.chrome.com/origintrials/#/trials/

##### Backend Setup (Express)
1. Create a `.env` file in the main folder by copying `env.example`.
2. Add MySQL credentials in the `.env` file.
3. If `FORCE_SYNC=true`, the server will automatically sync the database schema on every refresh.
4. Run the following commands:
   ```bash
   npm install
   npm start
   
### Frontend Setup (React + Chrome Extension)
1. Dist folder is included to upload on chrome exntension.If files are uploaded then,
2. Create a `.env` file in the main folder by copying `env.example`.
3. VITE_CHROME_AI_PROMPT will activate prompt api using Gemini nano, if false then it use the Gemini Flash 1.5 which is written in express api. 
npm install
npm run build
upload the file to chrome extension 


### Bugs Open 

https://issues.chromium.org/issues/380707232

https://issues.chromium.org/issues/380712811

https://issues.chromium.org/issues/381535058


Add support for buffers in uploadFile _ I had same issues so use memorystorage also comment on Github issues. 
https://github.com/google-gemini/generative-ai-js/issues/294