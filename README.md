# Sillar Toast

Accessible, polished toast notifications for React products. Built with TypeScript, no runtime UI dependency, semantic light/dark CSS variables, and a small store that can be used outside React.

Made with love in the Dominican Republic by [@uppy19d0](https://github.com/uppy19d0).

## Install

```bash
npm install sillar-toast
```

Import the stylesheet once:

```tsx
import 'sillar-toast/styles.css';
```

## React usage

```tsx
import { ToastProvider, ToastViewport, useToast } from 'sillar-toast/react';
import 'sillar-toast/styles.css';

function SaveButton() {
  const toast = useToast();

  return (
    <button
      onClick={() => toast.success('Saved', { description: 'Your changes are live.' })}
    >
      Save
    </button>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SaveButton />
      <ToastViewport position="bottom-right" />
    </ToastProvider>
  );
}
```

## API

```tsx
const toast = useToast();

toast.success('Payment received');
toast.info('New version available');
toast.warning('Usage limit is almost reached');
toast.danger('Could not save settings');

toast.notify({
  title: 'Invite sent',
  description: 'The recipient can now join your workspace.',
  action: { label: 'Undo', onClick: undoInvite },
});

await toast.promise(saveSettings(), {
  loading: 'Saving settings…',
  success: 'Settings saved',
  error: 'Could not save settings',
});
```

## Core store

Use the framework-neutral store for tests, non-React runtimes, or custom renderers:

```ts
import { createToastApi, createToastStore } from 'sillar-toast/store';

const store = createToastStore({ maxToasts: 5 });
const toast = createToastApi(store);

toast.success('Ready');
```

## Design goals

- Accessible live regions with `status` and `alert` roles.
- Dismissible, actionable, promise-aware notifications.
- Keyboard reachable viewport with `Alt + T` by default.
- Pause-on-hover/focus timers and animated progress for finite-duration toasts.
- Exit state support so closed notifications can animate before removal.
- Light/dark mode through `--slt-*` variables.
- No Radix, no UI runtime dependency.
- Global enough for dashboards, SaaS, ecommerce, finance, internal tools, and documentation sites.

## Viewport options

```tsx
<ToastViewport
  position="top-center"
  hotkey={['altKey', 'KeyT']}
  hotkeyLabel="Product notifications"
  maxToasts={5}
  removeDelay={220}
/>
```

Set `hotkey={null}` to disable the global shortcut. Use `renderToast` when a design system needs a fully custom card while keeping the Sillar store, provider, and accessibility flow.

## Development

```bash
npm install
npm run check
```

## License

MIT


## Supply-chain verification and runtime permissions

Runtime: React notifications, timers and browser accessibility behavior. Applications supply notification content and control external transports; this package does not upload notification data.

Install the exact version required by your application and commit your lockfile. Releases request npm provenance from GitHub Actions, and CI checks the dependency graph and package contents before publication. The artifact guard rejects recognized credential patterns, private/environment files, unsafe paths, missing attribution/metadata and unexpected consumer install hooks. It is a focused release check, not proof that every secret or malicious behavior is detectable.

```sh
npm install --save-exact sillar-toast@1.0.2
npm audit
npm audit signatures
```

When the installed graph has no registry dependencies, npm may report that there are no dependency signatures to verify.

Inspect the exact-version [Socket report](https://socket.dev/npm/package/sillar-toast/overview/1.0.2) and the npm provenance link. A successful CI check is not the same as a package score of 100. Socket also weighs dependency counts and real adoption; no score, download history or security guarantee is fabricated. Report suspected issues through SECURITY.md.
