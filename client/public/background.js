// Listen for tab updates and enable the side panel for the tab
chrome.tabs.onUpdated.addListener(async (tabId, _info, tab) => {
  if (!tab.url) return; // Skip if the tab doesn't have a URL
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "index.html",
      enabled: true,
    });
  } catch (error) {
    console.error("Error setting side panel options:", error);
  }
});

// Configure the side panel to open on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Listen for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "runScript") {
    // Query the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]; // Get the active tab

      if (tab && tab.url && isInjectable(tab.url)) {
        // Inject scripts into the tab if it's injectable
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          })
          .then(() => console.log("Scripts successfully injected."))
          .catch((error) => console.error("Error injecting scripts:", error));
      } else {
        console.error(
          "Cannot inject scripts into this tab. URL is restricted or invalid:",
          tab?.url,
        );
      }
    });

    // Helper function to check if a URL is injectable
    function isInjectable(url) {
      // Exclude chrome://, file://, and other restricted protocols
      const restrictedProtocols = ["chrome://", "file://", "about:blank"];
      return restrictedProtocols.every((protocol) => !url.startsWith(protocol));
    }
  }
});

// let user_signed_in = false;

// const CLIENT_ID =
//   "971984779347-9sac42plnt1vqlebtve9e1cke6clm5b3.apps.googleusercontent.com";
// const RESPONSE_TYPE = encodeURIComponent("token");
// const REDIRECT_URI = chrome.identity.getRedirectURL("oauth2");
// const STATE = encodeURIComponent("jsksf3");
// const SCOPE = encodeURIComponent("openid");
// const PROMPT = encodeURIComponent("consent");

// function create_oauth() {
//   let auth_url = `https://accounts.google.com/o/oauth2/v2/auth?`;

//   var auth_params = {
//     client_id: CLIENT_ID,
//     redirect_uri: REDIRECT_URI,
//     response_type: "token",
//     scope:
//       "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
//   };

//   const url = new URLSearchParams(Object.entries(auth_params));
//   url.toString();
//   auth_url += url;

//   return auth_url;
// }

// function is_user_signedIn() {
//   return user_signed_in;
// }
