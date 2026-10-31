# GitHub Copilot Instructions

## Checks and Verification

- Do not run tests or linting unless the user explicitly asks for them.
- When adding or changing error handling, use the existing utility functions and project conventions.
- Report unexpected errors using the existing logging conventions and include useful context. Avoid duplicate reports or logging expected validation and cancellation errors as unexpected failures.
- Place new React components in their own directories with matching component files. For new styled components, use colocated SCSS modules named after the component (for example, `Heading/Heading.jsx` and `Heading/Heading.module.scss`). Unstyled components do not need an empty stylesheet.
- Preserve the local styling pattern when editing existing components, including CSS modules and MUI/Emotion. Do not convert existing styles solely to enforce SCSS.
- Use explicit, descriptive classes for component styling instead of universal selectors such as `> *` or tag-based selectors. When a parent needs to style a child component, pass a class to the intended element rather than targeting all children.
- Name custom component props for passing CSS classes `classNames`, not `className`, and combine them with local classes using `clsx`. Keep React's native `className` attribute on DOM elements and preserve prop names required by third-party components.
- Prefer explicit media queries over CSS `clamp()` for responsive sizing. Define size changes and bounds at readable breakpoints.
- Use the shared screen-size variables from `src/app/variables.module.scss` for responsive width breakpoints instead of hardcoded pixel values.
- Use explicit spacing values instead of CSS safe-area expressions such as `env(safe-area-inset-top)` or `env(safe-area-inset-bottom)`.
- Match the formatting of the surrounding code. Use repository-configured formatting tools when available; do not download or introduce a formatter solely to format a change.
- Follow the existing project conventions for file and directory structure when creating new components.
- Prioritize the clsx utility for conditional class names in React components.
- Any component that renders jsx should follow React naming and rendering conventions. For example, component names should be PascalCase, and files should be named accordingly.
- Extract reusable JSX into PascalCase React components and render them with JSX, such as `<Links />`. Do not use `render*` helper functions, such as `renderLinks()`, inside components to produce JSX. Define extracted components outside their parent component in their own component files.
- Use aliases defined in `jsconfig.json`, such as `@/*`, `components/*`, `lib/*`, `utils/*`, and `context/*`, instead of parent-relative imports. For example, use `import Icon from 'components/shared/Icon/Icon';` or `import useExample from '@/hooks/useExample';`. Same-directory imports such as `./Heading.module.scss` are fine.
- Do not write tests for this project. Skip any test creation.
- Do not update README for every change. Update it only when usage or setup changes significantly.
- Do not perform unrelated refactoring without explicit permission. Keep changes focused on the requested task.
- Do not add new functionality without explicit permission.
- Do not remove existing functionality without explicit permission.
- Be explicit with variable naming and state management to ensure clarity and maintainability.
- Use concrete language in comments and explanations. Name the user action, data, and operation instead of vague terms such as "turn", "persist", or "refinement". For example, write "Save the final vehicle state once per user message or option selection" rather than "Persist once per turn". Distinguish React state updates, session API saves, and chat-message saves when relevant.
- Comments should explain the implications of the code for the user, the system state, and any side effects, rather than just describing what the code does.
- When adding a large `if` block, place a concise comment immediately above it explaining why the branch exists, its overall behavior, and any important user-facing effects or state changes. Do not merely restate the condition.

## Architecture and Organization

- Treat architecture, clear responsibilities, and file organization as first-class requirements.
- Every boolean variable, parameter, object property, React state value, and boolean-returning function must have an explicit boolean prefix: `is`, `does`, `has`, `should`, or `can`, according to its meaning. Use `should` for behavior-control flags, such as `shouldPreserveFilters`, not `preserveFilters`. This also applies to optional parameters and destructured options with boolean defaults. Use names such as `doesMatchPosition`, `isGroupedPosition`, and `hasMatchingParts` for predicates and conditions. Keep names describing arrays, objects, or other non-boolean results distinct from boolean predicates. Follow this rule for code we control; preserve names required by external APIs or libraries.
- Use descriptive intermediate variables for lookups, defaults, and transformations passed into functions when they clarify the meaning of each argument. For example, assign `selectedPart` and `requestedPosition` before calling `getPositionFilterValue(requestedPosition, selectedPart)` instead of passing inline `searchParams.get(...) || 'all'` expressions. Reuse those variables rather than repeating the same lookup.
- Colocate component utilities in the same folder as the component that uses them, not in a separate `utils/` subfolder.
- Make utility files recognizable by name: use `utils.js` when the containing directory clearly identifies their scope, or a descriptive `*-utils.js` name such as `part-utils.js` for shared modules. Keep related helpers together rather than creating a file for every function.
- When utilities are shared by components within a feature, keep one shared utility file in their nearest common feature folder instead of duplicating helpers. Use `src/utils/` only for utilities genuinely shared across features or client/server code.
- Keep React components focused on rendering and coordinating state. Extract pure data transformations and matching logic into utilities, and reusable stateful behavior into hooks.
- Add a concise comment immediately above every `useEffect` explaining when it runs and the user-facing behavior or state/side effect it coordinates. Use concrete language rather than restating the hook's syntax.
- Before adding a function, hook, or component, search for existing code that can be reused or extended. Extract shared behavior when appropriate instead of duplicating it.
- Keep related responsibilities together in cohesive modules. Avoid large components that contain unrelated logic, but do not split code into unnecessary abstractions.
- Colocate component files and styles in their component directories, following the existing project conventions.
- Keep architectural changes scoped to the requested work. Do not reorganize unrelated code or perform broad refactoring without explicit approval.
