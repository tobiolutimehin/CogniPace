# ADR 0001: Local-First Storage

## Status

Accepted

## Context

The current product is a browser extension MVP intended to work immediately without account creation, backend provisioning, or cloud dependencies.

## Decision

Persist application data locally using `chrome.storage.local` as the canonical storage mechanism for the current product stage.

## Consequences

- setup remains lightweight
- users can use the product without sign-in
- backup/export becomes important
- multi-device sync is intentionally unavailable

## Revisit Triggers

- explicit product decision to support sync
- need for cross-device continuity
- collaboration or shared state becomes a product requirement
