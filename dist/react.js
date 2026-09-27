import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { createToastApi, createToastStore, defaultToastStore, } from './store.js';
const ToastContext = React.createContext(null);
export function ToastProvider({ children, store, options }) {
    const ownedStore = React.useMemo(() => store ?? createToastStore(options), [store, options]);
    return _jsx(ToastContext.Provider, { value: ownedStore, children: children });
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
export function ToastViewport({ position = 'bottom-right', hotkeyLabel = 'Notifications', maxToasts, removeDelay = 220, renderToast, className, ...props }) {
    const store = useToastStore();
    const toasts = useToasts().filter((toast) => toast.visible).slice(0, maxToasts);
    return (_jsx("ol", { ...props, "data-sillar-toast": "viewport", "data-position": position, className: ['slt-viewport', className].filter(Boolean).join(' '), "aria-label": hotkeyLabel, role: "region", children: toasts.map((toast) => (_jsx("li", { className: "slt-viewport__item", children: renderToast ? renderToast(toast) : _jsx(ToastCard, { toast: toast, store: store, removeDelay: removeDelay }) }, toast.id))) }));
}
export function ToastCard({ toast, store = defaultToastStore, removeDelay = 220, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }) {
    const [paused, setPaused] = React.useState(false);
    const role = toast.variant === 'danger' ? 'alert' : 'status';
    const live = toast.variant === 'danger' ? 'assertive' : 'polite';
    React.useEffect(() => {
        if (paused || !Number.isFinite(toast.duration) || toast.duration <= 0)
            return;
        const timer = window.setTimeout(() => store.dismiss(toast.id), toast.duration);
        return () => window.clearTimeout(timer);
    }, [paused, store, toast.duration, toast.id, toast.updatedAt]);
    React.useEffect(() => {
        if (toast.visible)
            return;
        const timer = window.setTimeout(() => store.remove(toast.id), removeDelay);
        return () => window.clearTimeout(timer);
    }, [removeDelay, store, toast.id, toast.visible]);
    return (_jsxs("div", { ...props, "data-sillar-toast": "toast", "data-variant": toast.variant, "data-state": toast.visible ? 'open' : 'closed', role: role, "aria-live": live, className: ['slt-toast', className].filter(Boolean).join(' '), onMouseEnter: (event) => { setPaused(true); onMouseEnter?.(event); }, onMouseLeave: (event) => { setPaused(false); onMouseLeave?.(event); }, onFocus: (event) => { setPaused(true); onFocus?.(event); }, onBlur: (event) => { setPaused(false); onBlur?.(event); }, children: [_jsx("span", { className: "slt-toast__icon", "aria-hidden": "true", children: toast.icon ?? variantIcons[toast.variant] }), _jsxs("div", { className: "slt-toast__body", children: [_jsx("strong", { className: "slt-toast__title", children: toast.title }), toast.description ? _jsx("p", { className: "slt-toast__description", children: toast.description }) : null] }), toast.action ? (_jsx("button", { className: "slt-toast__action", type: "button", onClick: () => toast.action?.onClick?.(), "aria-label": toast.action.altText, children: toast.action.label })) : null, toast.dismissible ? (_jsx("button", { className: "slt-toast__close", type: "button", "aria-label": "Dismiss notification", onClick: () => store.dismiss(toast.id), children: "\u00D7" })) : null] }));
}
//# sourceMappingURL=react.js.map