import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Error handling function
export const handleApiError = (error: AxiosError) => {
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = (data as any)?.message || 'Invalid request data';
        break;
      case 401:
        message = 'Authentication required. Please log in.';
        // Clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/admin/login';
        break;
      case 403:
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        message = 'The requested resource was not found';
        break;
      case 409:
        message = (data as any)?.message || 'Resource already exists';
        break;
      case 422:
        // Validation errors
        if ((data as any)?.errors && Array.isArray((data as any).errors)) {
          const validationErrors = (data as any).errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ');
          message = `Validation failed: ${validationErrors}`;
        } else {
          message = (data as any)?.message || 'Validation failed';
        }
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = (data as any)?.message || `Error ${status}: ${error.message}`;
    }
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    message = error.message || 'An unexpected error occurred';
  }

  // Show toast notification
  toast.error(message);
};

// Success handler
export const handleApiSuccess = (message: string) => {
  toast.success(message);
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

// Contact types
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Portfolio types
export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioRequest {
  title: string;
  slug?: string;
  category: string;
  description: string;
  longDescription?: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  status?: 'draft' | 'published';
  sortOrder?: number;
}

// Experience types
export interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  achievements: string[];
  technologies: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  createdAt: string;
  updatedAt: string;
}

// Contact Message types
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  replied: boolean;
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// File upload types
export interface FileUpload {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  webpUrl?: string;
  processedVersions?: {
    original: string;
    thumbnail: string;
    medium: string;
    large: string;
    webp: string;
  };
}

export default api;
