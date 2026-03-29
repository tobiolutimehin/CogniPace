# ADR 0003: Plain CSS UI

## Status

Accepted

## Context

The current UI is implemented with plain CSS and direct DOM rendering. The product is still in an MVP-stage extension workflow, and introducing a more complex styling system would add overhead without yet solving a proven problem.

## Decision

Keep the current plain CSS approach for the current product stage.

## Consequences

- styling stays lightweight and easy to load in an extension context
- there is no dependency on a design-system framework or CSS-in-JS layer
- design consistency must be maintained through documentation and discipline

## Revisit Triggers

- styling drift becomes expensive
- theming requirements expand materially
- component reuse and UI consistency become difficult to manage with current CSS structure
