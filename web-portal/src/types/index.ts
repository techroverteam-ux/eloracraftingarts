// Re-export shared types from backend
export * from '../../../shared/types';

// Frontend-specific types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  modals: Record<string, ModalState>;
  loading: LoadingState;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    key: keyof T;
    direction: 'asc' | 'desc';
    onSort: (key: keyof T) => void;
  };
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export interface StepperProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
  currentStep: number;
}