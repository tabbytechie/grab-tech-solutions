# Frontend Application Architecture

## 🖥 Component State Machine
The dashboard and core interfaces are built using a strict **Reactive State Machine** pattern to ensure predictable UI transitions.

### Visual States
1. **Uninitialized:** Initial component mount.
2. **Fetching (Skeleton View):** Active data synchronization with visual placeholders.
3. **Active (Data Rendered):** Valid server-state displayed to the user.
4. **Processing (Disabled):** User interaction locked during async side-effects (e.g., login, task creation).
5. **Error Boundary:** Global or component-level catch for synchronization failures with "Retry" capabilities.

---

## 📊 Performance & Optimization
- **Memoization:** Critical filtering logic (searching/sorting) is wrapped in `useMemo` to prevent O(n) recalculations on unrelated state updates.
- **Layout Integrity:** Aspect-ratio boxes and fixed-dimension skeletons are used to prevent **Cumulative Layout Shift (CLS)** during data hydration.
- **Server-State Sync:** `TanStack Query` manages caching and background refetching (10s intervals) to maintain real-time accuracy without manual polling logic.

---

## 🛰 Client-Side Telemetry
A custom API interceptor in `lib/api.ts` provides deep observability of the frontend lifecycle.

### Trace Structures
Every API interaction emits a telemetry event:
- **API_REQUEST_INIT:** Maps the endpoint and correlation ID.
- **API_REQUEST_SUCCESS:** Logs status, duration, and success metadata.
- **API_REQUEST_FAILURE:** Captures specific error messages, status codes, and stack traces for remote debugging.

---

## 🧪 Behavioral Testing
We use **Vitest** and **React Testing Library** for behavior-driven validation.
- **Mocked API boundaries:** Isolation of components from actual network side-effects.
- **State Transition Tests:** Verifies that skeletons appear during loading and error boundaries trigger on failures.
- **Interaction Constraints:** Ensures "Submit" and "Sign Out" buttons adopt `disabled` flags during processing to prevent race conditions.
