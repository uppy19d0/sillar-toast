const DEFAULT_DURATION = 5000;
const DEFAULT_LOADING_DURATION = Number.POSITIVE_INFINITY;
let globalCounter = 0;
function normalizeMessage(message, variant) {
    return typeof message === 'string' ? { title: message, variant } : { variant, ...message };
}
function resolveMessage(message, value, variant) {
    return normalizeMessage(typeof message === 'function' ? message(value) : message, variant);
}
export function createToastStore(options = {}) {
    const listeners = new Set();
    const now = options.now ?? (() => Date.now());
    const defaultDuration = options.defaultDuration ?? DEFAULT_DURATION;
    const loadingDuration = options.loadingDuration ?? DEFAULT_LOADING_DURATION;
    const maxToasts = options.maxToasts ?? Number.POSITIVE_INFINITY;
    const idPrefix = options.idPrefix ?? 'toast';
    let toasts = [];
    function emit() {
        for (const listener of listeners)
            listener();
    }
    function snapshot() {
        return toasts.slice();
    }
    function trim(records) {
        if (!Number.isFinite(maxToasts))
            return records;
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
            const record = {
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
                if (toast.id !== id)
                    return toast;
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
export function createToastApi(store) {
    const api = {
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
            }
            catch (error) {
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
//# sourceMappingURL=store.js.map