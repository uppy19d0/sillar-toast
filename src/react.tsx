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
  const ownedStoreRef = React.useRef<ToastStore | null>(null);
  if (!ownedStoreRef.current && !store) ownedStoreRef.current = createToastStore(options);
  return <ToastContext.Provider value={store ?? ownedStoreRef.current ?? defaultToastStore}>{children}</ToastContext.Provider>;
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
  hotkey?: string[] | null;
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

const DEFAULT_HOTKEY = ['altKey', 'KeyT'];

export function ToastViewport({
  position = 'bottom-right',
  hotkeyLabel = 'Notifications',
  hotkey = DEFAULT_HOTKEY,
  maxToasts,
  removeDelay = 220,
  renderToast,
  className,
  tabIndex,
  ...props
}: ToastViewportProps) {
  const store = useToastStore();
  const viewportRef = React.useRef<HTMLOListElement>(null);
  const allToasts = useToasts();
  const toasts = allToasts.slice(0, maxToasts);

  React.useEffect(() => {
    if (!hotkey?.length) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const matches = hotkey.every((key) => {
        if (key === 'altKey') return event.altKey;
        if (key === 'ctrlKey') return event.ctrlKey;
        if (key === 'metaKey') return event.metaKey;
        if (key === 'shiftKey') return event.shiftKey;
        return event.code === key || event.key.toLowerCase() === key.toLowerCase();
      });
      if (!matches) return;
      event.preventDefault();
      viewportRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);

  React.useEffect(() => {
    const timers = allToasts
      .filter((toast) => !toast.visible)
      .map((toast) => window.setTimeout(() => store.remove(toast.id), removeDelay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [allToasts, removeDelay, store]);

  return (
    <ol
      {...props}
      ref={viewportRef}
      data-sillar-toast="viewport"
      data-position={position}
      data-hotkey={hotkey?.join('+') || undefined}
      className={['slt-viewport', className].filter(Boolean).join(' ')}
      aria-label={hotkeyLabel}
      role="region"
      tabIndex={tabIndex ?? -1}
    >
      {toasts.map((toast) => (
        <li key={toast.id} className="slt-viewport__item">
          {renderToast ? renderToast(toast) : <ToastCard toast={toast} store={store} />}
        </li>
      ))}
    </ol>
  );
}

export interface ToastCardProps extends React.HTMLAttributes<HTMLDivElement> {
  toast: ToastRecord;
  store?: ToastStore;
}

export function ToastCard({ toast, store = defaultToastStore, className, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, style, ...props }: ToastCardProps) {
  const [paused, setPaused] = React.useState(false);
  const role = toast.variant === 'danger' ? 'alert' : 'status';
  const live = toast.variant === 'danger' ? 'assertive' : 'polite';
  const showProgress = Number.isFinite(toast.duration) && toast.duration > 0;
  const toastStyle = showProgress ? { '--slt-toast-duration': `${toast.duration}ms`, ...style } : style;

  React.useEffect(() => {
    if (!toast.visible || paused || !Number.isFinite(toast.duration) || toast.duration <= 0) return;
    const timer = window.setTimeout(() => store.dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [paused, store, toast.duration, toast.id, toast.updatedAt, toast.visible]);

  return (
    <div
      {...props}
      data-sillar-toast="toast"
      data-variant={toast.variant}
      data-state={toast.visible ? 'open' : 'closed'}
      data-paused={paused || undefined}
      role={role}
      aria-live={live}
      className={['slt-toast', className].filter(Boolean).join(' ')}
      style={toastStyle as React.CSSProperties}
      onMouseEnter={(event) => { setPaused(true); onMouseEnter?.(event); }}
      onMouseLeave={(event) => { setPaused(false); onMouseLeave?.(event); }}
      onFocus={(event) => { setPaused(true); onFocus?.(event); }}
      onBlur={(event) => { setPaused(false); onBlur?.(event); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') store.dismiss(toast.id);
        onKeyDown?.(event);
      }}
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
      {showProgress ? <span className="slt-toast__progress" aria-hidden="true" /> : null}
    </div>
  );
}
