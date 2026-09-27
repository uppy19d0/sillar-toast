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
export declare function createToastStore(options?: CreateToastStoreOptions): ToastStore;
export declare function createToastApi(store: ToastStore): ToastApi;
export declare const defaultToastStore: ToastStore;
export declare const toast: ToastApi;
//# sourceMappingURL=store.d.ts.map