const toggleCheck = document.getElementById("toggleCheck");
const affiliateCheck = document.getElementById("affiliateCheck");
const statusText = document.getElementById("statusText");
const hiddenCountSpan = document.getElementById("hiddenCount");

// Localization
function localize() {
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    const msg = chrome.i18n.getMessage(key);
    if (msg) elem.textContent = msg;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  localize();

  chrome.storage.sync.get({ enabled: true, affiliateEnabled: false }, (data) => {
    updateUI(data.enabled);
    affiliateCheck.checked = data.affiliateEnabled;
  });

  chrome.storage.local.get({ totalHidden: 0, affiliateData: null }, (data) => {
    hiddenCountSpan.textContent = data.totalHidden;

    if (data.affiliateData && data.affiliateData.popup_html) {
      const footer = document.querySelector('.footer');
      if (footer) {
        footer.innerHTML = data.affiliateData.popup_html;
      }
    } else {
      // If data is missing or no popup_html, try to fetch fresh data
      // This covers the case where the user opens the popup before visiting a Temu page
      chrome.runtime.sendMessage({ action: "FETCH_AFFILIATE_DATA" }, (response) => {
        if (response && response.success && response.data) {
          chrome.storage.local.set({ affiliateData: response.data });
          if (response.data.popup_html) {
            const footer = document.querySelector('.footer');
            if (footer) footer.innerHTML = response.data.popup_html;
          }
        }
      });
    }
  });
});

function updateUI(enabled) {
  toggleCheck.checked = enabled;
  const activeText = chrome.i18n.getMessage("statusActive");
  const inactiveText = chrome.i18n.getMessage("statusInactive");
  statusText.textContent = enabled ? activeText : inactiveText;
  statusText.classList.toggle("off", !enabled);
}

toggleCheck.addEventListener("change", () => {
  const newState = toggleCheck.checked;
  chrome.storage.sync.set({ enabled: newState }, () => {
    updateUI(newState);
    // Reload active tab to apply changes immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });
});

affiliateCheck.addEventListener("change", () => {
  const newState = affiliateCheck.checked;
  chrome.storage.sync.set({ affiliateEnabled: newState });
});

