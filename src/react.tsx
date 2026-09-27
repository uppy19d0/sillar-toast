import * as React from 'react';
import {
  createToastApi,
  createToastStore,
  defaultToastStore,
  type CreateToastStoreOptions,
  type ToastApi,
  type ToastPosition,
  type ToastRecord,
  type ToastStore,
} from './store.js';

export interface ToastProviderProps {
  children: React.ReactNode;
  store?: ToastStore;
  options?: CreateToastStoreOptions;
}

const ToastContext = React.createContext<ToastStore | null>(null);

export function ToastProvider({ children, store, options }: ToastProviderProps) {
  const ownedStore = React.useMemo(() => store ?? createToastStore(options), [store, options]);
  return <ToastContext.Provider value={ownedStore}>{children}</ToastContext.Provider>;
}

export function useToastStore() {
  return React.useContext(ToastContext) ?? defaultToastStore;
}

export function useToasts() {
  const store = useToastStore();
  return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useToast(): ToastApi {
  const store = useToastStore();
  return React.useMemo(() => createToastApi(store), [store]);
}

export interface ToastViewportProps extends React.HTMLAttributes<HTMLOListElement> {
  position?: ToastPosition;
  hotkeyLabel?: string;
  maxToasts?: number;
  removeDelay?: number;
  renderToast?: (toast: ToastRecord) => React.ReactNode;
}

const variantIcons: Record<ToastRecord['variant'], string> = {
  default: '•',
  success: '✓',
  info: 'i',
  warning: '!',
  danger: '!',
  loading: '…',
};

export function ToastViewport({
  position = 'bottom-right',
  hotkeyLabel = 'Notifications',
  maxToasts,
  removeDelay = 220,
  renderToast,
  className,
  ...props
}: ToastViewportProps) {
  const store = useToastStore();
  const toasts = useToasts().filter((toast) => toast.visible).slice(0, maxToasts);

  return (
    <ol
      {...props}
      data-sillar-toast="viewport"
      data-position={position}
      className={['slt-viewport', className].filter(Boolean).join(' ')}
      aria-label={hotkeyLabel}
      role="region"
    >
      {toasts.map((toast) => (
        <li key={toast.id} className="slt-viewport__item">
          {renderToast ? renderToast(toast) : <ToastCard toast={toast} store={store} removeDelay={removeDelay} />}
        </li>
      ))}
    </ol>
  );
}

export interface ToastCardProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: ToastRecord;
  store?: ToastStore;
  removeDelay?: number;
}

export function ToastCard({ toast, store = defaultToastStore, removeDelay = 220, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }: ToastCardProps) {
  const [paused, setPaused] = React.useState(false);
  const role = toast.variant === 'danger' ? 'alert' : 'status';
  const live = toast.variant === 'danger' ? 'assertive' : 'polite';

  React.useEffect(() => {
    if (paused || !Number.isFinite(toast.duration) || toast.duration <= 0) return;
    const timer = window.setTimeout(() => store.dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [paused, store, toast.duration, toast.id, toast.updatedAt]);

  React.useEffect(() => {
    if (toast.visible) return;
    const timer = window.setTimeout(() => store.remove(toast.id), removeDelay);
    return () => window.clearTimeout(timer);
  }, [removeDelay, store, toast.id, toast.visible]);

  return (
    <div
      {...props}
      data-sillar-toast="toast"
      data-variant={toast.variant}
      data-state={toast.visible ? 'open' : 'closed'}
      role={role}
      aria-live={live}
      className={['slt-toast', className].filter(Boolean).join(' ')}
      onMouseEnter={(event) => { setPaused(true); onMouseEnter?.(event); }}
      onMouseLeave={(event) => { setPaused(false); onMouseLeave?.(event); }}
      onFocus={(event) => { setPaused(true); onFocus?.(event); }}
      onBlur={(event) => { setPaused(false); onBlur?.(event); }}
    >
      <span className="slt-toast__icon" aria-hidden="true">{toast.icon ?? variantIcons[toast.variant]}</span>
      <div className="slt-toast__body">
        <strong className="slt-toast__title">{toast.title}</strong>
        {toast.description ? <p className="slt-toast__description">{toast.description}</p> : null}
      </div>
      {toast.action ? (
        <button className="slt-toast__action" type="button" onClick={() => toast.action?.onClick?.()} aria-label={toast.action.altText}>
          {toast.action.label}
        </button>
      ) : null}
      {toast.dismissible ? (
        <button className="slt-toast__close" type="button" aria-label="Dismiss notification" onClick={() => store.dismiss(toast.id)}>
          ×
        </button>
      ) : null}
    </div>
  );
}
