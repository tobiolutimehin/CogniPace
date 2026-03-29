# ADR 0002: No Account System

## Status

Accepted

## Context

The product is intentionally scoped as an extension-first MVP focused on retention and guided progression, not as a hosted platform.

## Decision

Do not include account creation, authentication, identity, or user-profile infrastructure in the current product.

## Consequences

- no sign-in flow is required
- no backend identity system is required
- product complexity stays lower
- cloud-backed user features remain out of scope

## Revisit Triggers

- sync becomes a committed product requirement
- paid features or hosted user state become required
- team or multi-user workflows enter scope
