import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { createToastApi, createToastStore, defaultToastStore, } from './store.js';
const ToastContext = React.createContext(null);
export function ToastProvider({ children, store, options }) {
    const ownedStoreRef = React.useRef(null);
    if (!ownedStoreRef.current && !store)
        ownedStoreRef.current = createToastStore(options);
    return _jsx(ToastContext.Provider, { value: store ?? ownedStoreRef.current ?? defaultToastStore, children: children });
}
export function useToastStore() {
    return React.useContext(ToastContext) ?? defaultToastStore;
}
export function useToasts() {
    const store = useToastStore();
    return React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
export function useToast() {
    const store = useToastStore();
    return React.useMemo(() => createToastApi(store), [store]);
}
const variantIcons = {
    default: '•',
    success: '✓',
    info: 'i',
    warning: '!',
    danger: '!',
    loading: '…',
};
const DEFAULT_HOTKEY = ['altKey', 'KeyT'];
export function ToastViewport({ position = 'bottom-right', hotkeyLabel = 'Notifications', hotkey = DEFAULT_HOTKEY, maxToasts, removeDelay = 220, renderToast, className, tabIndex, ...props }) {
    const store = useToastStore();
    const viewportRef = React.useRef(null);
    const allToasts = useToasts();
    const toasts = allToasts.slice(0, maxToasts);
    React.useEffect(() => {
        if (!hotkey?.length)
            return;
        const onKeyDown = (event) => {
            const matches = hotkey.every((key) => {
                if (key === 'altKey')
                    return event.altKey;
                if (key === 'ctrlKey')
                    return event.ctrlKey;
                if (key === 'metaKey')
                    return event.metaKey;
                if (key === 'shiftKey')
                    return event.shiftKey;
                return event.code === key || event.key.toLowerCase() === key.toLowerCase();
            });
            if (!matches)
                return;
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
    return (_jsx("ol", { ...props, ref: viewportRef, "data-sillar-toast": "viewport", "data-position": position, "data-hotkey": hotkey?.join('+') || undefined, className: ['slt-viewport', className].filter(Boolean).join(' '), "aria-label": hotkeyLabel, role: "region", tabIndex: tabIndex ?? -1, children: toasts.map((toast) => (_jsx("li", { className: "slt-viewport__item", children: renderToast ? renderToast(toast) : _jsx(ToastCard, { toast: toast, store: store }) }, toast.id))) }));
}
export function ToastCard({ toast, store = defaultToastStore, className, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, style, ...props }) {
    const [paused, setPaused] = React.useState(false);
    const role = toast.variant === 'danger' ? 'alert' : 'status';
    const live = toast.variant === 'danger' ? 'assertive' : 'polite';
    const showProgress = Number.isFinite(toast.duration) && toast.duration > 0;
    const toastStyle = showProgress ? { '--slt-toast-duration': `${toast.duration}ms`, ...style } : style;
    React.useEffect(() => {
        if (!toast.visible || paused || !Number.isFinite(toast.duration) || toast.duration <= 0)
            return;
        const timer = window.setTimeout(() => store.dismiss(toast.id), toast.duration);
        return () => window.clearTimeout(timer);
    }, [paused, store, toast.duration, toast.id, toast.updatedAt, toast.visible]);
    return (_jsxs("div", { ...props, "data-sillar-toast": "toast", "data-variant": toast.variant, "data-state": toast.visible ? 'open' : 'closed', "data-paused": paused || undefined, role: role, "aria-live": live, className: ['slt-toast', className].filter(Boolean).join(' '), style: toastStyle, onMouseEnter: (event) => { setPaused(true); onMouseEnter?.(event); }, onMouseLeave: (event) => { setPaused(false); onMouseLeave?.(event); }, onFocus: (event) => { setPaused(true); onFocus?.(event); }, onBlur: (event) => { setPaused(false); onBlur?.(event); }, onKeyDown: (event) => {
            if (event.key === 'Escape')
                store.dismiss(toast.id);
            onKeyDown?.(event);
        }, children: [_jsx("span", { className: "slt-toast__icon", "aria-hidden": "true", children: toast.icon ?? variantIcons[toast.variant] }), _jsxs("div", { className: "slt-toast__body", children: [_jsx("strong", { className: "slt-toast__title", children: toast.title }), toast.description ? _jsx("p", { className: "slt-toast__description", children: toast.description }) : null] }), toast.action ? (_jsx("button", { className: "slt-toast__action", type: "button", onClick: () => toast.action?.onClick?.(), "aria-label": toast.action.altText, children: toast.action.label })) : null, toast.dismissible ? (_jsx("button", { className: "slt-toast__close", type: "button", "aria-label": "Dismiss notification", onClick: () => store.dismiss(toast.id), children: "\u00D7" })) : null, showProgress ? _jsx("span", { className: "slt-toast__progress", "aria-hidden": "true" }) : null] }));
}
//# sourceMappingURL=react.js.map