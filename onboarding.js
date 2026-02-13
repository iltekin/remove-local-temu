// Localization
function localize() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        const msg = chrome.i18n.getMessage(key);
        if (msg) elem.textContent = msg;
    });
}

document.addEventListener('DOMContentLoaded', localize);

document.getElementById('enableAffiliate').addEventListener('click', () => {
    chrome.storage.sync.set({ affiliateEnabled: true }, () => {
        // Show a little feedback maybe?
        const btn = document.getElementById('enableAffiliate');
        btn.textContent = "Enabled! ❤️";
        btn.style.background = "#fff";
        setTimeout(() => {
            window.close(); // Close the tab
        }, 1000);
    });
});

document.getElementById('skipAffiliate').addEventListener('click', () => {
    chrome.storage.sync.set({ affiliateEnabled: false }, () => {
        window.close();
    });
});
