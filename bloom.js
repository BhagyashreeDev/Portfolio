// ============================================================================
// BLOOMING EXPERTISE FLOWER CONTROLLER (bloom.js)
// Handles unfurling and folding of technical skill petals on click
// ============================================================================

// DOM Element References
const flowerStage = document.getElementById("flower-stage");
const centerPistil = document.getElementById("center-pistil");
const toggleBloomBtn = document.getElementById("toggle-bloom-btn");
const btnLabelText = document.getElementById("btn-label-text");
const pistilPrompt = document.getElementById("pistil-prompt");

/**
 * Toggles the flower between bloomed (open) and bud (closed) states.
 * Toggling the 'is-bloomed' CSS class triggers hardware-accelerated CSS transforms.
 */
function toggleBloom() {
    // Permanently remove the outward glow prompt after first click
    flowerStage.classList.remove("has-initial-glow");

    const isBloomed = flowerStage.classList.toggle("is-bloomed");
    
    if (isBloomed) {
        // State: Flower petals are open/unfurled
        btnLabelText.textContent = "Close";
        pistilPrompt.textContent = "Click to Close";
    } else {
        // State: Flower petals are folded inside bud
        btnLabelText.textContent = "Bloom";
        pistilPrompt.textContent = "Click to Bloom";
    }
}

// Event Listeners: Allow blooming via either the action button or clicking the central flower core
toggleBloomBtn.addEventListener("click", toggleBloom);
centerPistil.addEventListener("click", toggleBloom);

// ============================================================================
// TWILIGHT / MIDNIGHT MODE CONTROLLER
// Toggles between Day Cream and Night Indigo with glowing petals
// ============================================================================
const themeToggleBtn = document.getElementById("theme-toggle");

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("twilight-mode");
    const themeIcon = themeToggleBtn.querySelector(".theme-icon");
    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀️" : "🌙";
    }
    // Update 3D WebGL background lighting & fog if sakura3d.js is ready
    if (typeof window.setTwilightMode === "function") {
      window.setTwilightMode(isDark);
    }
    localStorage.setItem("portfolio_theme", isDark ? "dark" : "light");
  });

  // Restore saved theme on initial page load
  if (localStorage.getItem("portfolio_theme") === "dark") {
    document.body.classList.add("twilight-mode");
    const themeIcon = themeToggleBtn.querySelector(".theme-icon");
    if (themeIcon) {
      themeIcon.textContent = "☀️";
    }
    // Sync with Three.js scene once loaded
    window.addEventListener("load", () => {
      if (typeof window.setTwilightMode === "function") {
        window.setTwilightMode(true);
      }
    });
  }
}

// ============================================================================
// MOBILE NAVIGATION MENU CONTROLLER
// Handles hamburger menu open/close and auto-close on link navigation
// ============================================================================
const mobileNavToggle = document.getElementById("mobile-nav-toggle");
const mainNav = document.getElementById("main-nav");

if (mobileNavToggle && mainNav) {
  mobileNavToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    mobileNavToggle.classList.toggle("is-active", isOpen);
  });

  // Automatically close menu when any navigation link is clicked
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      mobileNavToggle.classList.remove("is-active");
    });
  });
}


