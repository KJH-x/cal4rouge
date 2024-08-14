chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);
    if (message.type === "someAsyncTask") {
        someAsyncFunction().then(result => {
            console.log("Async task completed successfully");
            sendResponse({ success: true, data: result });
        }).catch(error => {
            console.error("Async task failed:", error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Indicates async response
    }
});

