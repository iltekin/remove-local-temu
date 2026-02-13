/* global browserAPI */

const toggleCheck = document.getElementById("toggleCheck");
const statusText = document.getElementById("statusText");

// Durumu yükle
browserAPI.storage.sync.get({ enabled: true }, (data) => {
  updateUI(data.enabled);
});

// UI güncelleme
function updateUI(enabled) {
  toggleCheck.checked = enabled;
  statusText.textContent = enabled ? "Aktif" : "Pasif";
  statusText.classList.toggle("off", !enabled);
}

// Toggle yap
toggleCheck.addEventListener("change", () => {
  const newState = toggleCheck.checked;
  browserAPI.storage.sync.set({ enabled: newState }, () => {
    updateUI(newState);
    // Aktif sekmeye content script çalıştır
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browserAPI.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: toggleProducts,
        args: [newState],
      });
    });
  });
});

// İçerik script için fonksiyon
function toggleProducts(enabled) {
  if (!enabled) {
    // Sayfayı geri yükle
    location.reload();
  } else {
    // "Yerel" ürünleri sil
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