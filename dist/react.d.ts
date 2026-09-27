import * as React from 'react';
import { type CreateToastStoreOptions, type ToastApi, type ToastPosition, type ToastRecord, type ToastStore } from './store.js';
export interface ToastProviderProps {
    children: React.ReactNode;
    store?: ToastStore;
    options?: CreateToastStoreOptions;
}
export declare function ToastProvider({ children, store, options }: ToastProviderProps): React.JSX.Element;
export declare function useToastStore(): ToastStore;
export declare function useToasts(): ToastRecord[];
export declare function useToast(): ToastApi;
export interface ToastViewportProps extends React.HTMLAttributes<HTMLOListElement> {
    position?: ToastPosition;
    hotkeyLabel?: string;
    maxToasts?: number;
    removeDelay?: number;
    renderToast?: (toast: ToastRecord) => React.ReactNode;
}
export declare function ToastViewport({ position, hotkeyLabel, maxToasts, removeDelay, renderToast, className, ...props }: ToastViewportProps): React.JSX.Element;
export interface ToastCardProps extends React.HTMLAttributes<HTMLDivElement> {
    toast: ToastRecord;
    store?: ToastStore;
    removeDelay?: number;
}
export declare function ToastCard({ toast, store, removeDelay, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }: ToastCardProps): React.JSX.Element;
//# sourceMappingURL=react.d.ts.map