// Core domain types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ROOKIE = 'rookie',
  INSTALLATION = 'installation',
  CLIENT = 'client'
}

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  MEASURED = 'measured',
  IN_PRODUCTION = 'in_production',
  READY_FOR_INSTALLATION = 'ready_for_installation',
  INSTALLED = 'installed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  storeId: string;
  status: OrderStatus;
  items: OrderItem[];
  measurements?: Measurement;
  installation?: Installation;
  assignedRookie?: string;
  assignedInstaller?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productType: string;
  specifications: Record<string, any>;
  quantity: number;
  notes?: string;
}

export interface Measurement {
  id: string;
  orderId: string;
  rookieId: string;
  measurements: Record<string, number>;
  images: FileReference[];
  notes?: string;
  location?: GeoLocation;
  submittedAt: Date;
}

export interface Installation {
  id: string;
  orderId: string;
  installerId: string;
  proofImages: FileReference[];
  completionChecklist: Record<string, boolean>;
  notes?: string;
  completedAt?: Date;
}

export interface FileReference {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  googleDriveId?: string;
  localPath?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  stores: Store[];
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form validation types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'file' | 'textarea';
  required: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// UI State types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

export interface LoadingState {
  [key: string]: boolean;
}