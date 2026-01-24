/**
 * Configuration for the visual capture system
 * Organizes captures by functional area with metadata
 */

const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 375, height: 812 },
};

// Elements to mask to avoid capturing dynamic content
const MASK_SELECTORS = [
  'time',
  '.timeago',
  '[data-testid="mode-toggle"]',
  '.navbar__account',
  '.ph-clock',
  '.ph-odds',
  '.rg-cell.rg-col-stake',
  '.rg-cell.rg-col-odds',
  '.rg-cell.rg-col-status',
];

// Capture categories with individual capture targets
const CAPTURE_CONFIG = {
  // Core UI components
  coreUI: {
    title: "Core UI Components",
    captures: [
      {
        name: "navbar",
        selector: "nav.navbar",
        route: "/",
        description: "Main navigation bar",
      },
      {
        name: "mode_toggle",
        selector: '[data-testid="mode-toggle"]',
        route: "/",
        description: "Currency and betting mode toggle",
        skipMask: true,
      },
      {
        name: "version_footer",
        selector: ".version-footer",
        route: "/",
        description: "App version information",
      },
    ]
  },
  
  // Dashboard and match browsing
  dashboard: {
    title: "Dashboard & Match Discovery",
    captures: [
      {
        name: "dashboard_full",
        route: "/",
        fullPage: true,
        description: "Full dashboard page",
      },
      {
        name: "quick_stats",
        selector: ".dashboard-quick-stats",
        route: "/",
        description: "Dashboard quick stats bar",
      },
      {
        name: "hero_section",
        selector: ".dashboard-hero-section",
        route: "/",
        description: "Dashboard hero section",
      },
      {
        name: "featured_match",
        selector: ".featured-match-container",
        route: "/",
        description: "Featured match card",
      },
      {
        name: "matches_grid",
        selector: ".dashboard-matches-section",
        route: "/",
        description: "Live matches grid",
      },
      {
        name: "filter_bar",
        selector: ".filter-bar",
        route: "/",
        description: "Match filters",
      },
      {
        name: "match_details_drawer",
        routeFactory: (gameId) => `/matches/${gameId}`,
        selector: ".match-details-drawer",
        description: "Match details drawer",
        requiresGameId: true,
      },
    ]
  },
  
  // Game experience (Arcade mode)
  gameArcade: {
    title: "Game Experience - Arcade Mode",
    requiresGameId: true,
    preCapture: async (page, gameId) => {
      await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.match-layout-grid, .frame--board', { timeout: 15000 }).catch(() => {});
    },
    setupState: "arcade",
    captures: [
      {
        name: "game_arcade_full",
        fullPage: true,
        description: "Full game page in Arcade mode",
      },
      {
        name: "board_frame",
        selector: ".frame--board",
        description: "Chess board frame",
      },
      {
        name: "move_tiles",
        selector: "[data-tour-id='move-tiles']",
        description: "Move betting tiles",
      },
      {
        name: "notation_rail",
        selector: ".notation-rail",
        description: "Move notation panel",
      },
      {
        name: "receipts",
        selector: ".receipts-grid",
        description: "Bet receipts panel",
      },
      {
        name: "bottom_toolbar",
        selector: ".match-bottom-bar",
        description: "Bottom toolbar",
      },
      {
        name: "evaluation_bar",
        selector: ".evaluation-bar-container",
        description: "Game evaluation meter",
      },
    ]
  },
  
  // Game experience (Real mode)
  gameReal: {
    title: "Game Experience - Real Mode",
    requiresGameId: true,
    preCapture: async (page, gameId, token) => {
      await page.goto(`/chess/${gameId}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.match-layout-grid, .frame--board', { timeout: 15000 }).catch(() => {});
      // Try to place a bet for receipt visibility
      if (token) {
        const drawBtn = page.locator('button.bt-draw:not([disabled])').first();
        const ok = await drawBtn.isVisible({ timeout: 2000 }).catch(() => false);
        if (ok) await drawBtn.click();
      }
    },
    setupState: "real",
    captures: [
      {
        name: "game_real_full",
        fullPage: true,
        description: "Full game page in Real mode",
      },
      {
        name: "board_frame",
        selector: ".frame--board",
        description: "Chess board frame",
      },
      {
        name: "move_tiles",
        selector: "[data-tour-id='move-tiles']",
        description: "Move betting tiles",
      },
      {
        name: "notation_rail",
        selector: ".notation-rail",
        description: "Move notation panel",
      },
      {
        name: "receipts",
        selector: ".receipts-grid",
        description: "Bet receipts panel",
      },
      {
        name: "bottom_toolbar",
        selector: ".match-bottom-bar",
        description: "Bottom toolbar",
      },
    ]
  },
  
  // User account & profile
  userAccount: {
    title: "User Account & Profile",
    captures: [
      {
        name: "wallet_full",
        route: "/wallet",
        fullPage: true,
        description: "User wallet page",
      },
      {
        name: "active_bets",
        route: "/active-bets",
        fullPage: true,
        description: "Active bets page",
      },
      {
        name: "betting_history",
        route: "/betting-history",
        fullPage: true,
        description: "Betting history page",
      },
      {
        name: "user_profile",
        route: "/user",
        fullPage: true,
        description: "User profile page",
      },
    ]
  },
  
  // Authentication forms
  authForms: {
    title: "Authentication Forms",
    requiresGuestContext: true,
    captures: [
      {
        name: "signin",
        route: "/signin",
        fullPage: true,
        description: "Sign in form",
      },
      {
        name: "signup",
        route: "/signup",
        fullPage: true,
        description: "Sign up form",
      },
    ]
  },
  
  // Admin interfaces
  adminUI: {
    title: "Admin Interfaces",
    requiresAdmin: true,
    captures: [
      {
        name: "admin_home",
        route: "/admin",
        fullPage: true,
        description: "Admin home",
      },
      {
        name: "admin_wallet",
        route: "/admin/wallet",
        fullPage: true,
        description: "Admin wallet management",
      },
      {
        name: "admin_ops",
        route: "/admin/ops",
        fullPage: true,
        description: "Admin operations",
      },
      {
        name: "admin_kyc",
        route: "/admin/kyc",
        fullPage: true,
        description: "Admin KYC management",
      },
      {
        name: "admin_risk",
        route: "/admin/risk",
        fullPage: true,
        description: "Admin risk management",
      },
      // Additional admin pages
      {
        name: "admin_features",
        route: "/admin/features",
        fullPage: true,
        description: "Admin feature toggles",
      },
    ]
  },
  
  // Onboarding tour elements
  onboardingUI: {
    title: "Onboarding Experience",
    setupState: "showOnboarding",
    captures: [
      {
        name: "onboarding_welcome",
        route: "/",
        selector: ".onboarding-tour-overlay",
        description: "Welcome onboarding overlay",
      },
      {
        name: "onboarding_dashboard",
        route: "/",
        selector: ".onboarding-tour-layer",
        description: "Dashboard feature callouts",
      },
      {
        name: "onboarding_game",
        routeFactory: (gameId) => `/chess/${gameId}`,
        selector: ".onboarding-tour-layer",
        description: "Game UI feature callouts",
        requiresGameId: true,
      },
    ]
  },
};

module.exports = {
  VIEWPORTS,
  MASK_SELECTORS,
  CAPTURE_CONFIG,
};