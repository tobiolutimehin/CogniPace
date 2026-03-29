# Design Guidelines

## Purpose

This document captures the current visual and interaction direction for the extension.

It is a design reference, not the canonical product spec. Product truth lives in `docs/product.md` and `docs/features.md`.

## Visual Direction

- technical
- compact
- direct
- utility-first
- extension-appropriate

The UI should feel like a sharp browser tool rather than a marketing site or mobile consumer app.

## Popup-First Constraints

- the popup is the primary user-facing surface
- hierarchy should emphasize the best next action immediately
- the layout should remain narrow, compact, and single-column
- dense is acceptable if the information order is clear

## Dashboard Guidelines

- the dashboard should feel like an operational control surface
- overview, courses, library, analytics, and settings should stay visually distinct
- the dashboard should not drift into a generic product shell unrelated to study flow

## Overlay Guidelines

- the overlay should remain supportive rather than dominant
- quick logging must feel fast
- expanded controls should be available without overwhelming the page

## Copy And Label Tone

- short
- literal
- operational
- low-fluff

Labels should explain the state directly, for example:

- `Due now`
- `Overdue`
- `Review focus`
- `Next in course`

## UI Hierarchy Rules

- lead with the next action
- keep recommendation and course progression visibly separate
- make secondary controls visually secondary
- use status and difficulty badges sparingly but clearly

## What Not To Design

- landing pages
- sign-in flows
- generic SaaS dashboards
- large storytelling layouts
- oversized hero sections
- desktop app sidebars inside the popup

## Compact Extension Interaction Principles

- avoid unnecessary navigation
- keep frequent actions one click away
- prefer direct actions over modal workflows
- preserve enough context for the user to decide quickly

## Relationship To Stitch

The existing Stitch document is a supporting design-generation artifact. This file is the higher-level design reference that contributors should follow before using or updating Stitch-oriented prompts.
