# ADR 0004: No Backend Service

## Status

Accepted

## Context

The current product does not require hosted compute to deliver its core extension workflow. Review scheduling, queue construction, course progression, and analytics can all run locally.

## Decision

Do not introduce a backend service for the current product stage.

## Consequences

- deployment stays simple
- operating cost stays low
- storage, analytics, and notifications remain local or extension-native
- server-backed features remain unavailable by design

## Revisit Triggers

- sync becomes a committed requirement
- cross-user or cross-device state is needed
- server-side analytics or processing becomes necessary for approved product goals
