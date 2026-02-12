/* global browserAPI */

browserAPI.storage.sync.get({ enabled: true }, (data) => {
    if (data.enabled) removeLocalProducts();
});

const observer = new MutationObserver(() => {
    browserAPI.storage.sync.get({ enabled: true }, (data) => {
        if (data.enabled) removeLocalProducts();
    });
});

observer.observe(document.body, { childList: true, subtree: true });

function removeLocalProducts() {
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
