/* global browserAPI */

const toggleBtn = document.getElementById('toggleBtn');

// Durumu yükle
browserAPI.storage.sync.get({ enabled: true }, (data) => {
    updateButton(data.enabled);
});

// Buton güncelleme
function updateButton(enabled) {
    toggleBtn.textContent = enabled ? 'Yerel Ürünleri Gizle: Açık' : 'Yerel Ürünleri Gizle: Kapalı';
}

// Toggle yap
toggleBtn.addEventListener('click', () => {
    browserAPI.storage.sync.get({ enabled: true }, (data) => {
        const newState = !data.enabled;
        browserAPI.storage.sync.set({ enabled: newState }, () => {
            updateButton(newState);
            // Aktif sekmeye content script çalıştır
            browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                browserAPI.scripting.executeScript({
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
            if (span.textContent.trim() === 'Yerel' || span.textContent.trim() === 'Local') {
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