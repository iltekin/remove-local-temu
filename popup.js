const toggleBtn = document.getElementById('toggleBtn');

// Durumu yükle
chrome.storage.sync.get({ enabled: true }, (data) => {
    updateButton(data.enabled);
});

// Buton güncelleme
function updateButton(enabled) {
    toggleBtn.textContent = enabled ? 'Yerel Ürünleri Gizle: Açık' : 'Yerel Ürünleri Gizle: Kapalı';
}

// Toggle yap
toggleBtn.addEventListener('click', () => {
    chrome.storage.sync.get({ enabled: true }, (data) => {
        const newState = !data.enabled;
        chrome.storage.sync.set({ enabled: newState }, () => {
            updateButton(newState);
            // Aktif sekmeye content script çalıştır
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: toggleProducts,
                    args: [newState]
                });
            });
        });
    });
});

// İçerik script için fonksiyon
function toggleProducts(enabled) {
    if (!enabled) {
        // Sayfayı geri yükle gibi davranabilir
        location.reload();
    } else {
        // "Yerel" ürünleri sil
        document.querySelectorAll('span').forEach(span => {
            if (span.textContent.trim() === 'Yerel') {
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
