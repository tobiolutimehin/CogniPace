# Architecture

## System Overview

The extension is a Manifest V3 Chrome extension with four runtime surfaces:

- popup
- content script overlay
- dashboard
- background service worker

The background service worker is the operational center. UI surfaces request data or mutations through runtime messages, and shared modules in `src/shared/*` keep the core logic centralized.

## Runtime Surfaces

### Popup

Source: `src/popup/index.ts`

Responsibilities:

- render the compact recommendation-first UI
- show due count, streak, recommendation, and course-next state
- switch study mode
- open problems or the dashboard
- shuffle recommendation candidates locally

The popup is the main user entry point.

### Content Script Overlay

Source: `src/content.ts`

Responsibilities:

- attach UI to supported LeetCode problem pages
- detect page context such as slug and difficulty
- show collapsed and expanded review UI
- manage timer state, notes, and selected rating
- save review results through runtime messaging

This surface is the in-context solving and review layer.

### Dashboard

Source: `src/dashboard/index.ts`

Responsibilities:

- render overview, courses, library, analytics, and settings views
- show broader product state than the popup
- support settings updates, backup import/export, and course management
- expose searchable and filterable library and analytics views

This is the secondary control surface.

### Background Service Worker

Source: `src/background.ts`

Responsibilities:

- load and mutate application state
- build queue, recommendation, analytics, course, and shell payloads
- handle runtime messages
- manage notification scheduling and quiet-hour logic
- coordinate import/export and course-related mutations

This is the canonical runtime mutation boundary.

## Shared Modules And Responsibilities

### Queue

Source: `src/shared/queue.ts`

Builds the daily queue, including due, new, and reinforcement items, using the current settings and study state.

### Recommendations

Source: `src/shared/recommendations.ts`

Converts queue items into user-facing recommendation candidates and reasons such as `Due now`, `Overdue`, and `Review focus`.

### Scheduler

Source: `src/shared/scheduler.ts`

Applies review results and produces updated review scheduling state using the FSRS-backed scheduler.

### Study State

Source: `src/shared/studyState.ts`

Normalizes legacy and current review state, computes summaries, and bridges storage data with scheduling logic.

### Storage

Source: `src/shared/storage.ts`

Loads, normalizes, saves, and mutates the core app data stored in `chrome.storage.local`.

### Courses

Source: `src/shared/courses.ts`

Manages course definitions, chapter progression, question progression, active course selection, and course-derived views.

### Curated Sets

Source: `src/shared/curatedSets.ts`

Defines the built-in study plans and problem catalogs that seed the structured course experience.

### Analytics

Source: `src/shared/analytics.ts`

Builds summary metrics such as streak, retention proxy, due-by-day forecast, and weakest problems.

### Repository Parsing And Import

Source: `src/shared/repository.ts`

Handles problem normalization, import ingestion, parsing of user-provided slugs or URLs, and library upsert behavior.

### Runtime Messaging

Source: `src/shared/runtime.ts`, `src/shared/types.ts`

Defines the request/response message layer used between UI surfaces and the background service worker.

## Persisted Data Model

The core app data is represented by `AppData` and stored locally.

Important persisted areas:

- `problemsBySlug`
- `studyStatesBySlug`
- `coursesById`
- `courseOrder`
- `courseProgressById`
- `settings`

Key user-facing projections derived from that data include:

- `TodayQueue`
- `AnalyticsSummary`
- `PopupViewData`
- `ActiveCourseView`
- `LibraryProblemRow`

Current export payload includes:

- `version`
- `problems`
- `studyStatesBySlug`
- `settings`
- `coursesById`
- `courseOrder`
- `courseProgressById`

## Runtime Message Flow

Message contracts are defined in `MessageRequestMap`.

Major message categories:

- page and review actions
  - `UPSERT_PROBLEM_FROM_PAGE`
  - `GET_PROBLEM_CONTEXT`
  - `RATE_PROBLEM`
  - `SAVE_REVIEW_RESULT`
  - `UPDATE_NOTES`
  - `UPDATE_TAGS`
- app shell and queue retrieval
  - `GET_TODAY_QUEUE`
  - `GET_DASHBOARD_DATA`
  - `GET_APP_SHELL_DATA`
- course actions
  - `SWITCH_ACTIVE_COURSE`
  - `SET_ACTIVE_COURSE_CHAPTER`
  - `TRACK_COURSE_QUESTION_LAUNCH`
  - `ADD_PROBLEM_TO_COURSE`
- import/export and settings
  - `IMPORT_CURATED_SET`
  - `IMPORT_CUSTOM_SET`
  - `EXPORT_DATA`
  - `IMPORT_DATA`
  - `UPDATE_SETTINGS`
  - `ADD_PROBLEM_BY_INPUT`
- maintenance actions
  - `SUSPEND_PROBLEM`
  - `RESET_PROBLEM_SCHEDULE`
  - `OPEN_EXTENSION_PAGE`

UI surfaces should not bypass this messaging boundary for persisted state changes.

## Current Technical Constraints

- Manifest V3 Chrome extension
- local-first persistence
- no backend service
- no account model
- plain CSS UI layer
- dynamic HTML rendering still exists and is tracked for later hardening

Related ADRs:

- `docs/decisions/0001-local-first-storage.md`
- `docs/decisions/0002-no-account-system.md`
- `docs/decisions/0003-plain-css-ui.md`
- `docs/decisions/0004-no-backend-service.md`
- `docs/decisions/0005-minimal-extension-permissions.md`

## Where Future Work Should Go

- Product behavior changes should first be reflected in `docs/product.md` and `docs/features.md`
- Shared logic should prefer `src/shared/*` rather than duplicating logic in UI surfaces
- State mutations should continue to flow through the background worker
- Security hardening for DOM rendering belongs in a later implementation phase, not in the documentation layer

## Canonicality Notes

- This document is the technical source of truth for current structure.
- ADRs under `docs/decisions/` record why major current constraints exist.
- `docs/stitch-design-doc.md` is not an architecture document.
- If runtime interfaces, message contracts, or persisted data shapes change, this file should be updated in the same PR.
