<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- RLS policies must never re-query their own table through a helper function (e.g. `can_manage_event(id, ...)` on `events`): during `INSERT ... RETURNING` the new row is not visible to that re-entrant lookup, so owner inserts fail with "new row violates row-level security". Check ownership directly on the row's columns (`owner_id = auth.uid()`), keeping helpers for cross-table checks.
- Dot-nested route files nest in TanStack Router (`organizer.$eventId.tsx` is a child of `organizer.tsx`). A route file that has dot-children must be a layout rendering `<Outlet />`; its page content lives in the `.index.tsx` sibling (see `organizer.tsx`/`organizer.index.tsx` and `events.tsx`/`events.index.tsx`).
