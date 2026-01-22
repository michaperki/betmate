# UI Screenshot Capture System

This guide explains the modular screenshot capture system for the BetMate application. The system organizes screenshots by functional area and provides detailed reporting.

## Overview

The capture system is designed to:

1. Take screenshots of UI components across multiple viewports
2. Organize captures by functional area rather than by viewport size
3. Generate detailed metadata for each capture
4. Provide an HTML report for reviewing captures
5. Allow for targeted captures of specific component areas

## Structure

The capture system consists of the following components:

- **Configuration**: `capture-config.js` defines capture targets by category
- **Utilities**: `capture-utils.js` provides helper functions for the capture process
- **Modular tests**: Separate test files for different functional areas in `tests/capture/`
- **Main test**: `visual-capture-modular.spec.ts` runs all captures in one go
- **Reporting**: `generate-capture-report.js` creates an HTML report from captures

## Running Captures

### Full Capture

To capture all UI components across all viewports:

```bash
# Set environment variables
# Windows PowerShell
$env:E2E_BACKEND_URL = 'http://localhost:9000'  # Backend URL (if not default)
$env:CAPTURE_TAG = 'baseline'                   # Tag for organizing outputs

# Linux/macOS
export E2E_BACKEND_URL=http://localhost:9000
export CAPTURE_TAG=baseline

# Run the full capture
npm run e2e:capture

# Generate an HTML report
npm run e2e:capture:report
```

### Targeted Captures

Capture specific functional areas:

```bash
# Core UI components only
npm run e2e:capture:core

# Dashboard and matches only
npm run e2e:capture:dashboard

# Game experience only
npm run e2e:capture:game

# Admin interfaces only
npm run e2e:capture:admin
```

## Capture Outputs

Captures are organized by tag, viewport, and functional area:

```
e2e/captures/
  ├── baseline/                   # Capture tag
  │   ├── desktop/                # Viewport
  │   │   ├── coreUI/             # Functional area
  │   │   │   ├── navbar.png      
  │   │   │   ├── mode_toggle.png 
  │   │   │   └── ...
  │   │   ├── dashboard/
  │   │   ├── gameArcade/
  │   │   └── ...
  │   ├── tablet/
  │   │   └── ...
  │   ├── mobile/
  │   │   └── ...
  │   ├── manifests/              # JSON metadata by category
  │   │   ├── coreUI.json
  │   │   ├── dashboard.json
  │   │   └── ...
  │   ├── index.json              # Root manifest
  │   ├── summary.json            # Capture summary stats
  │   └── report.html             # Generated HTML report
  └── ...
```

## Adding New Capture Targets

To add new components to capture:

1. Edit `capture-config.js` and add new entries to the appropriate category:

```javascript
// Example: Adding a new component to the coreUI category
coreUI: {
  title: "Core UI Components",
  captures: [
    // ... existing captures ...
    {
      name: "new_component",
      selector: ".new-component",
      route: "/some-route",
      description: "Description of the component",
    }
  ]
}
```

2. Or add a new category:

```javascript
newCategory: {
  title: "New Feature Area",
  captures: [
    {
      name: "feature_overview",
      route: "/feature",
      fullPage: true,
      description: "Full page view of the feature",
    },
    {
      name: "feature_detail",
      selector: ".feature-detail",
      route: "/feature",
      description: "Detail component of the feature",
    }
  ]
}
```

## Comparing Captures

The capture system supports visual comparison between runs:

1. Run a baseline capture: `CAPTURE_TAG=baseline npm run e2e:capture`
2. Make UI changes
3. Run a comparison capture: `CAPTURE_TAG=after-changes npm run e2e:capture`
4. Compare the outputs manually or use the HTML report

## Tips for Effective Captures

1. **Use specific selectors**: Prefer `data-testid` attributes over complex CSS selectors
2. **Include helpful descriptions**: Clear descriptions help team members understand the purpose of components
3. **Consider adding state variations**: Capture components in different states (loading, empty, filled, error, etc.)
4. **Mask dynamic content**: Update `MASK_SELECTORS` in `capture-config.js` to hide timestamps, counters, etc.
5. **Run captures regularly**: Integrate into your workflow to catch visual regressions

## Troubleshooting

- **Element not found**: Check selector in the browser DevTools
- **Authentication issues**: Ensure backend is running and the test can authenticate
- **Empty captures**: Check that the component is visible and not hidden by other elements
- **Slow captures**: Try running targeted captures instead of the full suite