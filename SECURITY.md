# Security Policy

## Reporting A Vulnerability

Please do not open a normal issue for security problems.

Report suspected vulnerabilities privately to:

- `olutimehintobi@gmail.com`

Include:

- a short summary of the issue
- affected area or file paths if known
- reproduction steps or proof of concept
- potential impact
- any suggested mitigation if you already have one

## Response Expectations

- Initial response target: within 3 business days
- Ongoing status updates: at least weekly until the issue is resolved or triaged

## Supported Versions

Only the latest `main` branch is considered supported for security fixes.

## Areas That Need Extra Care

- `public/manifest.json`
- runtime contracts and validators under `src/extension/runtime/*`
- background handlers under `src/extension/background/*`
- Chrome datasource and storage access under `src/data/datasources/chrome/*`
- import/export and backup parsing under `src/data/importexport/*`
- content overlay behavior on LeetCode pages

## Disclosure

Please keep details private until a fix or mitigation has landed and maintainers confirm disclosure is safe.
