# genesys-contact-center-risk-router

Board-readable risk router for Genesys-style contact center queues, SLA pressure, abandonment, transfer drift, repeat-contact posture, sentiment risk, staffing coverage, and revenue-impact triage.

[![ci](https://github.com/mizcausevic-dev/genesys-contact-center-risk-router/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/genesys-contact-center-risk-router/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/genesys-contact-center-risk-router/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/genesys-contact-center-risk-router/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Contact center dashboards usually show operational metrics. Leadership needs a clearer route:

- Which queues are putting retention, renewal, or customer trust at risk?
- Where are service levels, abandon rates, repeat contacts, and staffing gaps compounding?
- Which queue should receive executive intervention before customer experience becomes revenue leakage?

This repo converts synthetic Genesys-style queue telemetry into a board-readable risk router.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx genesys-contact-center-risk-router fixtures/genesys-risk-sample.json --format markdown
npx genesys-contact-center-risk-router fixtures/genesys-risk-sample.json --format json
```

## Kinetic Gain fit

This adds a Genesys and CX operations signal to the Kinetic Gain estate: queue-level customer risk, revenue exposure, routing drift, and executive intervention posture in one reusable proof surface.
