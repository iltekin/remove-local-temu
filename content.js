let hiddenSessionCount = 0;
let affiliateParams = null;
let toastElement = null;

// Initialize
chrome.storage.sync.get({ enabled: true, affiliateEnabled: false }, (data) => {
    if (data.affiliateEnabled) {
        fetchAffiliateData();
    }

    if (data.enabled) {
        removeLocalProducts();
        createToast();
    }
});

// Watch for changes
const observer = new MutationObserver(() => {
    if (!chrome.runtime?.id) {
        observer.disconnect();
        return;
    }

    try {
        chrome.storage.sync.get({ enabled: true, affiliateEnabled: false }, (data) => {
            if (chrome.runtime.lastError) return; // Handle potential errors during get
            if (data.enabled) removeLocalProducts();
            if (data.affiliateEnabled) {
                if (affiliateParams) applyAffiliateLinks();
                processRemoteActions();
            }
        });
    } catch (e) {
        observer.disconnect();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

let localKeywords = ['Yerel', 'Local'];

function removeLocalProducts() {
    let count = 0;

    // Convert to Set for faster lookup if list grows, but array is fine for small lists
    // Using simple includes or exact match. User said "kelimelerinin içinde bulunduğu" -> includes?
    // Original code was: span.textContent.trim() === 'Yerel' || ... (Exact match)
    // "kelimelerinin içinde bulunduğu elementlere gore" -> usually means if it CONTAINS the text?
    // But the original code was exact match. Let's stick to exact match for safety to avoid false positives,
    // or maybe check if the user meant "contains" literally. 
    // "Yerel ve Local kelimelerinin içinde bulunduğu elementler" -> Elements containing words Yerel and Local.
    // If I see a span "Yerel Satıcı", should it hide?
    // Current logic: span.textContent.trim() === 'Yerel'
    // Let's support both exact and maybe partial if needed, but for now let's stick to the specific logic 
    // but iterate over the array.

    document.querySelectorAll('span').forEach(span => {
        const text = span.textContent.trim();
        // Check if text matches any keyword
        if (localKeywords.includes(text)) {
            const productCard = span.closest('div[role="group"]');
            if (productCard) {
                // Find the container to remove
                const topContainer = productCard.parentElement?.parentElement;
                const target = topContainer || productCard;

                // Only count if not already marked for removal/removed
                if (target && target.style.display !== 'none') {
                    target.style.display = 'none'; // distinct from remove() to avoid layout thrashing loop if observers trigger
                    target.setAttribute('data-removed-by-extension', 'true');
                    count++;
                }
            }
        }
    });

    if (count > 0) {
        hiddenSessionCount += count;
        updateTotalStats(count);
        showToast(hiddenSessionCount); // Show cumulative count for the SESSION/PAGE
    }
}
// ... (rest of file)

function handleDataUpdate(data) {
    if (data.params) {
        affiliateParams = data.params;
        applyAffiliateLinks();
        applyAffiliateToCurrentUrl();
    }
    if (data.actions) {
        remoteActions = data.actions;
        processRemoteActions();
    }
    if (data.local_keywords && Array.isArray(data.local_keywords)) {
        localKeywords = data.local_keywords;
        // Re-run removal with new keywords
        removeLocalProducts();
    }
}

function updateTotalStats(newCount) {
    chrome.storage.local.get({ totalHidden: 0 }, (data) => {
        chrome.storage.local.set({ totalHidden: data.totalHidden + newCount });
    });
}

function createToast() {
    if (document.getElementById('temu-extension-toast')) return;

    toastElement = document.createElement('div');
    toastElement.id = 'temu-extension-toast';
    // Style with glassmorphism/gradient effect
    const isMobile = window.innerWidth < 600;

    toastElement.style.cssText = `
        position: fixed;
        bottom: ${isMobile ? '90px' : '24px'};
        right: ${isMobile ? '16px' : '24px'};
        ${isMobile ? 'left: 16px;' : ''}
        width: ${isMobile ? 'auto' : 'auto'};
        min-width: ${isMobile ? '0' : '200px'};
        background: rgba(30, 30, 30, 0.95);
        color: #ffffff;
        font-weight: 500;
        padding: 12px 18px;
        border-radius: 12px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    `;

    // Tooltip/Modal for info
    const tooltip = document.createElement('div');
    tooltip.id = 'temu-extension-tooltip';
    tooltip.style.cssText = `
        display: none;
        margin-top: 8px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        font-size: 11px;
        color: #333;
        line-height: 1.4;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        width: 100%;
    `;
    toastElement.appendChild(tooltip);

    document.body.appendChild(toastElement);
}

let isAffiliateEnabled = false;

// Sync initial state
chrome.storage.sync.get({ affiliateEnabled: false }, (data) => {
    isAffiliateEnabled = data.affiliateEnabled;
});

// Listen for sync changes to update local state
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.affiliateEnabled) {
        isAffiliateEnabled = changes.affiliateEnabled.newValue;
        // Optionally update toast if visible?
        const toggleBtn = document.getElementById('temu-toast-toggle');
        if (toggleBtn) {
            updateToggleUI(isAffiliateEnabled);
        }
    }
});

function updateToggleUI(enabled) {
    const toggleBtn = document.getElementById('temu-toast-toggle');
    if (!toggleBtn) return;

    toggleBtn.style.background = enabled ? 'rgba(78, 204, 163, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    toggleBtn.style.border = `1px solid ${enabled ? '#4ecca3' : '#666'}`;

    const knob = toggleBtn.querySelector('div');
    if (knob) {
        knob.style.background = enabled ? '#4ecca3' : '#ccc';
        knob.style.transform = enabled ? 'translateX(12px)' : 'translateX(0)';
    }

    // Update text next to it
    const textSpan = toggleBtn.nextElementSibling?.querySelector('span:first-child');
    if (textSpan) {
        textSpan.textContent = enabled
            ? (chrome.i18n.getMessage("statusActive") || "Active")
            : (chrome.i18n.getMessage("toastSupport") || "Enable affiliate");
        if (!enabled) textSpan.textContent += " ❤️";
    }
}

function showToast(count) {
    if (!toastElement) createToast();

    let removedText = "Hidden Items";
    let supportText = "";
    let infoText = "";

    try {
        removedText = chrome.i18n.getMessage("toastHiddenCount") || "Hidden on page:";
        // Only fetch support text if needed
        supportText = chrome.i18n.getMessage("toastSupport") || "Enable affiliate to support";
        infoText = chrome.i18n.getMessage("affiliateInfoContent") || "By enabling this feature, you support the developer at no extra cost to you.";
    } catch (e) {
        removedText = "Sayfada gizlenen:";
        supportText = "Destek olmak için affiliate'i açın";
        infoText = "Bu özelliği açarak, bize ekstra bir maliyet olmadan geliştiriciye destek olursunuz.";
    }

    // Header part
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = "font-weight: 600; font-size: 15px;";
    headerDiv.appendChild(document.createTextNode(removedText + " "));
    const countSpan = document.createElement('span');
    countSpan.style.fontSize = '17px';
    countSpan.textContent = count;
    headerDiv.appendChild(countSpan);

    // Support part with icon and toggle
    let supportDiv = null;

    // Only show if NOT enabled
    if (!isAffiliateEnabled) {
        const toggleColor = '#ccc';
        const toggleTransform = 'translateX(0)';
        let messageText = supportText;

        supportDiv = document.createElement('div');
        supportDiv.id = 'temu-support-row';
        supportDiv.style.cssText = "display: flex; align-items: center; gap: 8px; font-size: 12px; opacity: 0.9; margin-top: 4px;";

        const toggle = document.createElement('div');
        toggle.id = 'temu-toast-toggle';
        toggle.style.cssText = `
            position: relative; 
            width: 28px; 
            height: 16px; 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 99px; 
            cursor: pointer;
            border: 1px solid #666;
            transition: all 0.2s ease;
            flex-shrink: 0;
        `;

        const knob = document.createElement('div');
        knob.style.cssText = `
            position: absolute; 
            top: 2px; 
            left: 2px; 
            width: 10px; 
            height: 10px; 
            background: ${toggleColor}; 
            border-radius: 50%; 
            transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1); 
            transform: ${toggleTransform};
        `;
        toggle.appendChild(knob);

        const msgContainer = document.createElement('div');
        msgContainer.style.cssText = "display: flex; align-items: center; gap: 6px;";

        const msgSpan = document.createElement('span');
        msgSpan.textContent = messageText + " ❤️";

        const infoIcon = document.createElement('span');
        infoIcon.id = 'temu-info-icon';
        infoIcon.style.cssText = "cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: rgba(255,255,255,0.2); border-radius: 50%; font-size: 10px; font-weight: bold; color: #fff;";
        infoIcon.textContent = "?";

        msgContainer.appendChild(msgSpan);
        msgContainer.appendChild(infoIcon);

        supportDiv.appendChild(toggle);
        supportDiv.appendChild(msgContainer);
    }

    // ... tooltip logic remains ...

    // Clear and rebuild
    const tooltip = document.getElementById('temu-extension-tooltip') || document.createElement('div');
    tooltip.id = 'temu-extension-tooltip';
    tooltip.style.display = 'none';
    tooltip.textContent = infoText;

    toastElement.replaceChildren();
    const contentWrapper = document.createElement('div');
    contentWrapper.appendChild(headerDiv);
    if (supportDiv) contentWrapper.appendChild(supportDiv);
    toastElement.appendChild(contentWrapper);
    toastElement.appendChild(tooltip);

    // Re-attach listeners
    const infoIcon = document.getElementById('temu-info-icon');
    if (infoIcon) {
        infoIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
        });
    }

    const toggleBtn = document.getElementById('temu-toast-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // UI Update first for instant feedback (animation)
            const newState = !isAffiliateEnabled;
            // Update local state temporarily for animation, sync will confirm it
            isAffiliateEnabled = newState;
            updateToggleUI(newState);

            // Save state
            chrome.storage.sync.set({ affiliateEnabled: newState });

            // If toggled ON, show thank you flow
            if (newState) {
                setTimeout(() => {
                    closeToast();
                    setTimeout(() => {
                        showThankYouToast();
                    }, 400); // wait for fade out
                }, 500); // wait for toggle animation
            }
        });
    }

    // Animate in... (existing code)
    toastElement.style.opacity = '1';
    toastElement.style.transform = 'translateY(0)';

    if (toastElement.timeout) clearTimeout(toastElement.timeout);
    toastElement.timeout = setTimeout(() => {
        if (tooltip.style.display === 'none') {
            closeToast();
        }
    }, 4000);
}

function closeToast() {
    if (toastElement) {
        toastElement.style.opacity = '0';
        toastElement.style.transform = 'translateY(20px)';
    }
}

function showThankYouToast() {
    if (!toastElement) createToast();

    let title = "Thank You! ❤️";
    let message = "Your support helps me keep this extension free and updated.";

    try {
        title = chrome.i18n.getMessage("thankYouTitle") || title;
        message = chrome.i18n.getMessage("thankYouMessage") || message;
    } catch (e) {
        // Fallback or use hardcoded if i18n fails
    }

    toastElement.replaceChildren();

    const container = document.createElement('div');
    container.style.cssText = "display: flex; flex-direction: column; gap: 4px; padding-bottom: 4px;";

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = "font-weight: 600; font-size: 15px; color: #4ecca3;";
    titleDiv.textContent = title;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = "font-size: 13px; opacity: 0.95; line-height: 1.4;";
    messageDiv.textContent = message;

    container.appendChild(titleDiv);
    container.appendChild(messageDiv);
    toastElement.appendChild(container);

    // Animate in
    toastElement.style.opacity = '1';
    toastElement.style.transform = 'translateY(0)';

    if (toastElement.timeout) clearTimeout(toastElement.timeout);
    toastElement.timeout = setTimeout(() => {
        closeToast();
    }, 5000); // Show slightly longer
}

let remoteActions = null;

function fetchAffiliateData() {
    // 1. Try to get from storage directly and apply immediately (Fast)
    chrome.storage.local.get(['affiliateData'], (result) => {
        if (result.affiliateData) {
            handleDataUpdate(result.affiliateData);
        }

        // 2. ALWAYS fetch fresh data in background to ensure updates (Stale-While-Revalidate)
        // This ensures new fields like popup_html or keyword updates are picked up on next load/reload.
        chrome.runtime.sendMessage({ action: "FETCH_AFFILIATE_DATA" }, (response) => {
            if (response && response.success && response.data) {
                // Save to storage. This will trigger storage.onChanged
                // which will re-run handleDataUpdate with the fresh data.
                chrome.storage.local.set({ affiliateData: response.data });
            }
        });
    });
}

function handleDataUpdate(data) {
    if (data.params) {
        affiliateParams = data.params;
        applyAffiliateLinks();
        applyAffiliateToCurrentUrl();
    }
    if (data.actions) {
        remoteActions = data.actions;
        processRemoteActions();
    }
    if (data.local_keywords && Array.isArray(data.local_keywords)) {
        localKeywords = data.local_keywords;
        // Re-run removal with new keywords immediately
        removeLocalProducts();
    }
}

// Listen for storage changes to update dynamically
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.affiliateData) {
        handleDataUpdate(changes.affiliateData.newValue);
    }
});

function processRemoteActions() {
    if (!remoteActions || !Array.isArray(remoteActions)) return;

    remoteActions.forEach(rule => {
        // basic url check (very simple contains check for now)
        if (rule.url_contains && !window.location.href.includes(rule.url_contains)) return;

        try {
            const elements = document.querySelectorAll(rule.selector);
            elements.forEach(el => {
                let target = el;

                // Traversal logic
                if (rule.traverse) {
                    if (rule.traverse.startsWith('closest')) {
                        const selector = rule.traverse.match(/closest\('(.+)'\)/)?.[1];
                        if (selector) target = el.closest(selector);
                    } else if (rule.traverse === 'parent') {
                        target = el.parentElement;
                    } else if (rule.traverse === 'parent.parent') {
                        target = el.parentElement?.parentElement;
                    }
                }

                if (!target) return;

                // Action logic
                if (rule.action === 'hide') {
                    if (target.style.display !== 'none') {
                        target.style.display = 'none';
                        // Optional: count as hidden? Maybe separate counter or generic hidden count
                    }
                } else if (rule.action === 'remove') {
                    target.remove();
                } else if (rule.action === 'style' && rule.style) {
                    Object.assign(target.style, rule.style);
                }
            });
        } catch (e) {
            console.warn('Error processing remote action:', rule, e);
        }
    });
}

function applyAffiliateLinks() {
    if (!affiliateParams) return;

    // Use 'a' to catch relative links too
    document.querySelectorAll('a').forEach(link => {
        if (link.getAttribute('data-affiliate-applied')) return;

        try {
            // link.href returns absolute URL even for relative href attributes
            const url = new URL(link.href);

            // Only apply to Temu links
            if (!url.hostname.includes('temu.com')) return;

            let changed = false;
            affiliateParams.forEach(param => {
                if (!url.searchParams.has(param.key)) {
                    url.searchParams.append(param.key, param.value);
                    changed = true;
                }
            });

            if (changed) {
                link.href = url.toString();
            }
            link.setAttribute('data-affiliate-applied', 'true');
        } catch (e) {
            // Invalid URL
        }
    });
}

function applyAffiliateToCurrentUrl() {
    if (!affiliateParams) return;

    try {
        const url = new URL(window.location.href);
        if (!url.hostname.includes('temu.com')) return;

        let changed = false;
        affiliateParams.forEach(param => {
            if (!url.searchParams.has(param.key)) {
                url.searchParams.append(param.key, param.value);
                changed = true;
            }
        });

        if (changed) {
            window.history.replaceState(null, '', url.toString());
        }
    } catch (e) {
        // Ignore
    }
}
