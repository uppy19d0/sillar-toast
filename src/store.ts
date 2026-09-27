export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'danger' | 'loading';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastAction {
  label: string;
  altText?: string;
  onClick?: () => void;
}

export interface ToastInput {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface ToastRecord extends Required<Pick<ToastInput, 'id' | 'title' | 'variant' | 'dismissible'>> {
  description?: string;
  duration: number;
  action?: ToastAction;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  visible: boolean;
}

export interface ToastStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): ToastRecord[];
  notify(input: ToastInput): string;
  update(id: string, input: Partial<Omit<ToastInput, 'id'>>): void;
  dismiss(id: string): void;
  remove(id: string): void;
  clear(): void;
}

export interface ToastApi {
  notify(input: ToastInput): string;
  success(title: string, input?: Omit<ToastInput, 'title' | 'variant'>): string;
  info(title: string, input?: Omit<ToastInput, 'title' | 'variant'>): string;
  warning(title: string, input?: Omit<ToastInput, 'title' | 'variant'>): string;
  danger(title: string, input?: Omit<ToastInput, 'title' | 'variant'>): string;
  loading(title: string, input?: Omit<ToastInput, 'title' | 'variant'>): string;
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T>;
  dismiss(id: string): void;
  remove(id: string): void;
  clear(): void;
}

export interface ToastPromiseMessages<T> {
  loading: string | ToastInput;
  success: string | ((value: T) => string | ToastInput);
  error: string | ((error: unknown) => string | ToastInput);
}

export interface CreateToastStoreOptions {
  defaultDuration?: number;
  loadingDuration?: number;
  maxToasts?: number;
  idPrefix?: string;
  now?: () => number;
}

const DEFAULT_DURATION = 5000;
const DEFAULT_LOADING_DURATION = Number.POSITIVE_INFINITY;
let globalCounter = 0;

function normalizeMessage(message: string | ToastInput, variant: ToastVariant): ToastInput {
  return typeof message === 'string' ? { title: message, variant } : { variant, ...message };
}

function resolveMessage<T>(message: string | ((value: T) => string | ToastInput) | ToastInput, value: T, variant: ToastVariant) {
  return normalizeMessage(typeof message === 'function' ? message(value) : message, variant);
}

export function createToastStore(options: CreateToastStoreOptions = {}): ToastStore {
  const listeners = new Set<() => void>();
  const now = options.now ?? (() => Date.now());
  const defaultDuration = options.defaultDuration ?? DEFAULT_DURATION;
  const loadingDuration = options.loadingDuration ?? DEFAULT_LOADING_DURATION;
  const maxToasts = options.maxToasts ?? Number.POSITIVE_INFINITY;
  const idPrefix = options.idPrefix ?? 'toast';
  let toasts: ToastRecord[] = [];

  function emit() {
    for (const listener of listeners) listener();
  }

  function snapshot() {
    return toasts.slice();
  }

  function trim(records: ToastRecord[]) {
    if (!Number.isFinite(maxToasts)) return records;
    return records.slice(0, maxToasts);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: snapshot,
    notify(input) {
      const id = input.id ?? `${idPrefix}-${++globalCounter}`;
      const createdAt = now();
      const variant = input.variant ?? 'default';
      const duration = input.duration ?? (variant === 'loading' ? loadingDuration : defaultDuration);
      const record: ToastRecord = {
        id,
        title: input.title,
        description: input.description,
        variant,
        duration,
        dismissible: input.dismissible ?? true,
        action: input.action,
        icon: input.icon,
        metadata: input.metadata,
        createdAt,
        updatedAt: createdAt,
        visible: true,
      };
      toasts = trim([record, ...toasts.filter((toast) => toast.id !== id)]);
      emit();
      return id;
    },
    update(id, input) {
      const updatedAt = now();
      toasts = toasts.map((toast) => {
        if (toast.id !== id) return toast;
        const variant = input.variant ?? toast.variant;
        return {
          ...toast,
          ...input,
          variant,
          duration: input.duration ?? (variant === 'loading' ? loadingDuration : toast.duration),
          dismissible: input.dismissible ?? toast.dismissible,
          updatedAt,
          visible: true,
        };
      });
      emit();
    },
    dismiss(id) {
      toasts = toasts.map((toast) => toast.id === id ? { ...toast, visible: false, updatedAt: now() } : toast);
      emit();
    },
    remove(id) {
      toasts = toasts.filter((toast) => toast.id !== id);
      emit();
    },
    clear() {
      toasts = [];
      emit();
    },
  };
}

export function createToastApi(store: ToastStore): ToastApi {
  const api: ToastApi = {
    notify: (input) => store.notify(input),
    success: (title, input = {}) => store.notify({ ...input, title, variant: 'success' }),
    info: (title, input = {}) => store.notify({ ...input, title, variant: 'info' }),
    warning: (title, input = {}) => store.notify({ ...input, title, variant: 'warning' }),
    danger: (title, input = {}) => store.notify({ ...input, title, variant: 'danger' }),
    loading: (title, input = {}) => store.notify({ ...input, title, variant: 'loading' }),
    async promise(promise, messages) {
      const loading = normalizeMessage(messages.loading, 'loading');
      const id = store.notify(loading);
      try {
        const value = await promise;
        store.update(id, resolveMessage(messages.success, value, 'success'));
        return value;
      } catch (error) {
        store.update(id, resolveMessage(messages.error, error, 'danger'));
        throw error;
      }
    },
    dismiss: (id) => store.dismiss(id),
    remove: (id) => store.remove(id),
    clear: () => store.clear(),
  };

  return api;
}

export const defaultToastStore = createToastStore();
export const toast = createToastApi(defaultToastStore);
