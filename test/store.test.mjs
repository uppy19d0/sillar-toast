import assert from 'node:assert/strict';
import test from 'node:test';
import { createToastApi, createToastStore } from '../dist/store.js';

test('store creates, updates, dismisses, and removes notifications', () => {
  const store = createToastStore({ idPrefix: 'test', now: () => 100 });
  const changes = [];
  const unsubscribe = store.subscribe(() => changes.push(store.getSnapshot().length));

  const id = store.notify({ title: 'Saved', variant: 'success' });
  assert.equal(id, 'test-1');
  assert.equal(store.getSnapshot()[0].title, 'Saved');
  assert.equal(store.getSnapshot()[0].visible, true);

  store.update(id, { title: 'Updated', description: 'Done' });
  assert.equal(store.getSnapshot()[0].title, 'Updated');
  assert.equal(store.getSnapshot()[0].description, 'Done');

  store.dismiss(id);
  assert.equal(store.getSnapshot()[0].visible, false);

  store.remove(id);
  assert.equal(store.getSnapshot().length, 0);
  unsubscribe();
  assert.ok(changes.length >= 4);
});

test('store honors maxToasts and replaces duplicate ids', () => {
  const store = createToastStore({ maxToasts: 2 });
  store.notify({ id: 'a', title: 'A' });
  store.notify({ id: 'b', title: 'B' });
  store.notify({ id: 'c', title: 'C' });
  assert.deepEqual(store.getSnapshot().map((toast) => toast.id), ['c', 'b']);

  store.notify({ id: 'b', title: 'B2' });
  assert.deepEqual(store.getSnapshot().map((toast) => toast.id), ['b', 'c']);
  assert.equal(store.getSnapshot()[0].title, 'B2');
});

test('toast api resolves promise notifications', async () => {
  const store = createToastStore();
  const toast = createToastApi(store);
  const result = await toast.promise(Promise.resolve('ok'), {
    loading: 'Saving',
    success: (value) => ({ title: `Saved ${value}`, description: 'Complete' }),
    error: 'Failed',
  });

  assert.equal(result, 'ok');
  const [record] = store.getSnapshot();
  assert.equal(record.variant, 'success');
  assert.equal(record.title, 'Saved ok');
});

test('toast api updates rejected promise notifications', async () => {
  const store = createToastStore();
  const toast = createToastApi(store);

  await assert.rejects(() => toast.promise(Promise.reject(new Error('boom')), {
    loading: 'Saving',
    success: 'Saved',
    error: 'Failed',
  }), /boom/);

  const [record] = store.getSnapshot();
  assert.equal(record.variant, 'danger');
  assert.equal(record.title, 'Failed');
});
