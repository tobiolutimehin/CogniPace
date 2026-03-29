# ADR 0005: Minimal Extension Permissions

## Status

Accepted

## Context

Extensions should request only the permissions needed for the current product behavior. Over-permissioning increases review burden, user distrust, and security risk.

## Decision

Keep extension permissions limited to the smallest set required for the current product workflow and treat permission expansion as a high-scrutiny change.

## Consequences

- permission additions require deliberate review
- feature design should prefer working within the current permission model
- security and trust posture remain tighter

## Revisit Triggers

- a new approved feature cannot be implemented with the current permission set
- Chrome platform changes require a different permission approach
- a documented product decision explicitly expands extension capabilities
