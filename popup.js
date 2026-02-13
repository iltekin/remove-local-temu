const toggleCheck = document.getElementById("toggleCheck");
const statusText = document.getElementById("statusText");

chrome.storage.sync.get({ enabled: true }, (data) => {
  updateUI(data.enabled);
});

function updateUI(enabled) {
  toggleCheck.checked = enabled;
  statusText.textContent = enabled ? "Aktif" : "Pasif";
  statusText.classList.toggle("off", !enabled);
}

toggleCheck.addEventListener("change", () => {
  const newState = toggleCheck.checked;
  chrome.storage.sync.set({ enabled: newState }, () => {
    updateUI(newState);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: toggleProducts,
        args: [newState],
      });
    });
  });
});

function toggleProducts(enabled) {
  if (!enabled) {
    location.reload();
  } else {
    document.querySelectorAll("span").forEach((span) => {
      if (
        span.textContent.trim() === "Yerel" ||
        span.textContent.trim() === "Local"
      ) {
        const productCard = span.closest('div[role="group"]');
        if (productCard) {
          const topContainer = productCard.parentElement?.parentElement;
          if (topContainer) {
            topContainer.remove();
          } else {
            productCard.remove();
          }
        }
      }
    });
  }
}
