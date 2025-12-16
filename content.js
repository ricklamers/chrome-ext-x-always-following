// X Always Following - Content Script
// Automatically switches to the "Following" timeline when "For you" is selected

(function() {
  'use strict';

  const MAX_ATTEMPTS = 50;
  const RETRY_DELAY = 200;

  function switchToFollowing() {
    let attempts = 0;

    function trySwitch() {
      attempts++;

      // Find the timeline tabs - they're anchor elements in the navigation
      const tabs = document.querySelectorAll('[role="tablist"] [role="tab"]');

      if (tabs.length >= 2) {
        let forYouTab = null;
        let followingTab = null;

        tabs.forEach(tab => {
          const text = tab.textContent.toLowerCase();
          if (text.includes('for you')) {
            forYouTab = tab;
          } else if (text.includes('following')) {
            followingTab = tab;
          }
        });

        if (forYouTab && followingTab) {
          // Check if "For you" is currently selected (has aria-selected="true")
          const forYouSelected = forYouTab.getAttribute('aria-selected') === 'true';

          if (forYouSelected) {
            // Click the Following tab
            followingTab.click();
            console.log('[X Always Following] Switched to Following timeline');
          } else {
            console.log('[X Always Following] Already on Following timeline');
          }
          return true;
        }
      }

      // Retry if tabs not found yet
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(trySwitch, RETRY_DELAY);
      } else {
        console.log('[X Always Following] Could not find timeline tabs');
      }
      return false;
    }

    trySwitch();
  }

  // Only run on the home page
  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/home';
  }

  // Run when page loads
  if (isHomePage()) {
    // Wait for page to be ready
    if (document.readyState === 'complete') {
      switchToFollowing();
    } else {
      window.addEventListener('load', switchToFollowing);
    }
  }

  // Watch for navigation changes (X is a SPA)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (isHomePage()) {
        switchToFollowing();
      }
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });
})();
