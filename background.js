chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FETCH_AFFILIATE_DATA") {
        fetch('https://iltekin.com/extensions/remove-local-temu/data.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => sendResponse({ success: true, data: data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Will respond asynchronously
    }
});
// ... existing fetch listener ...

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: "onboarding.html" });
    }
});
