/**
 * Extended configuration for theme-specific visual captures
 * Extends the base capture configuration with light/dark theme testing
 */

const { VIEWPORTS, MASK_SELECTORS, CAPTURE_CONFIG } = require('./capture-config');

// Theme-specific capture configurations
const THEME_CAPTURE_CONFIG = {
  // Dashboard with theme toggling
  themeUI: {
    title: "Theme UI Components",
    captures: [
      // Dark theme captures
      {
        name: "dashboard_dark",
        route: "/",
        fullPage: true,
        description: "Full dashboard page in dark theme",
        setupState: "darkTheme"
      },
      {
        name: "stats_bar_dark",
        selector: ".stats-container",
        route: "/",
        description: "Enhanced stats bar in dark theme",
        setupState: "darkTheme"
      },
      {
        name: "button_demo_dark",
        selector: ".button-demo",
        route: "/",
        description: "Button component demo in dark theme",
        setupState: "darkTheme"
      },
      {
        name: "theme_toggle_dark",
        selector: ".theme-indicator",
        route: "/",
        description: "Theme toggle in dark theme",
        setupState: "darkTheme"
      },
      
      // Light theme captures
      {
        name: "dashboard_light",
        route: "/",
        fullPage: true,
        description: "Full dashboard page in light theme",
        setupState: "lightTheme"
      },
      {
        name: "stats_bar_light",
        selector: ".stats-container",
        route: "/",
        description: "Enhanced stats bar in light theme",
        setupState: "lightTheme"
      },
      {
        name: "button_demo_light",
        selector: ".button-demo",
        route: "/",
        description: "Button component demo in light theme",
        setupState: "lightTheme"
      },
      {
        name: "theme_toggle_light",
        selector: ".theme-indicator",
        route: "/",
        description: "Theme toggle in light theme",
        setupState: "lightTheme"
      }
    ]
  }
};

module.exports = {
  VIEWPORTS,
  MASK_SELECTORS,
  THEME_CAPTURE_CONFIG
};