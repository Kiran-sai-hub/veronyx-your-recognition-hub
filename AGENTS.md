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

- Keep feature and design-system components router-agnostic and prop-driven so they can move to Next.js; route files alone own TanStack Router APIs.
- Keep prototype data in typed service/data modules so future live integrations can replace it without rewriting screens.
- AI Copilot is a single shell-level sheet opened through the app store (openCopilot); screens never own their own copilot, and every AI entry point must have a manual path. Why: one consistent, screen-aware AI surface that can be disabled.
- docs/veronyx-recognise-ui-flow-checklist.md is the product source of truth; resolve screen/UX doubts against it before inventing behaviour.
- Route files that gain a child route must become pure layouts rendering <Outlet />; the old page body moves to a sibling *.index.tsx leaf. Why: a parent that renders its own page silently hides every child route.
