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
- Light/dark mode through `--slt-*` variables.
- No Radix, no UI runtime dependency.
- Global enough for dashboards, SaaS, ecommerce, finance, internal tools, and documentation sites.

## Development

```bash
npm install
npm run check
```

## License

MIT
