import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createToastStore } from '../dist/store.js';
import { ToastProvider, ToastViewport } from '../dist/react.js';

test('React viewport renders accessible notifications from a provided store', () => {
  const store = createToastStore();
  store.notify({
    title: 'Invite sent',
    description: 'The teammate can join now.',
    variant: 'success',
    action: { label: 'Undo', altText: 'Undo invite' },
  });

  const html = renderToStaticMarkup(
    React.createElement(ToastProvider, { store },
      React.createElement(ToastViewport, { position: 'top-center' })),
  );

  assert.match(html, /data-sillar-toast="viewport"/);
  assert.match(html, /data-position="top-center"/);
  assert.match(html, /role="region"/);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Invite sent/);
  assert.match(html, /Undo invite/);
});

test('danger notifications render assertive alert semantics', () => {
  const store = createToastStore();
  store.notify({ title: 'Failed', variant: 'danger' });

  const html = renderToStaticMarkup(
    React.createElement(ToastProvider, { store }, React.createElement(ToastViewport, null)),
  );

  assert.match(html, /role="alert"/);
  assert.match(html, /aria-live="assertive"/);
});
