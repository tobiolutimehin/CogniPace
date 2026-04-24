## 2026-03-31 - Fix useDeferredValue dependency trap\n\n**Learning:** Passing an entire object into a `useMemo` dependency array defeats `useDeferredValue` if another property on that object changes frequently (like a search input query triggering object recreation). The `useMemo` re-runs synchronously on every keystroke with the *old* deferred value, causing input lag.\n**Action:** Destructure the needed primitive properties from the state object and use those in the dependency array alongside the deferred value.

## 2026-03-31 - Memoizing List Item Components

**Learning:** When mapping large lists of elements like course questions inside a parent view that triggers frequent re-renders or interacts heavily with other components, extracting the mapped row into a `React.memo`ized component drastically reduces re-render performance costs, allowing unrelated state updates to bypass expensive DOM diffing for list items.
**Action:** Default to extracting complex row mappings into memoized components within dashboard or list view layouts when applying Bolt optimizations.
