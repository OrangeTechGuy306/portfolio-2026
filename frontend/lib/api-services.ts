import { 
  api, 
  ApiResponse, 
  PaginatedResponse,
  LoginRequest, 
  LoginResponse, 
  ContactRequest,
  Portfolio,
  PortfolioRequest,
  Experience,
  ContactMessage,
  FileUpload
} from './api';

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<{ user: LoginResponse['user'] }>>('/auth/profile');
    return response.data.data!.user;
  },

  updateProfile: async (data: { name?: string; email?: string; avatar?: string }) => {
    const response = await api.put<ApiResponse<{ user: LoginResponse['user'] }>>('/auth/profile', data);
    return response.data.data!.user;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put<ApiResponse>('/auth/change-password', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken
    });
    return response.data.data!;
  }
};

// Contact Services
export const contactService = {
  submit: async (data: ContactRequest): Promise<void> => {
    const response = await api.post<ApiResponse>('/contact', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get<PaginatedResponse<ContactMessage>>('/contact', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ contact: ContactMessage }>>(`/contact/${id}`);
    return response.data.data!.contact;
  },

  reply: async (id: number, replyMessage: string) => {
    const response = await api.post<ApiResponse>(`/contact/${id}/reply`, { replyMessage });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.patch<ApiResponse>(`/contact/${id}/status`, { status });
    return response.data;
  },

  archive: async (id: number) => {
    const response = await api.patch<ApiResponse>(`/contact/${id}/archive`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/contact/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<{ stats: any }>>('/contact/stats');
    return response.data.data!.stats;
  }
};

// Portfolio Services
export const portfolioService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    category?: string;
    featured?: boolean;
    search?: string;
    orderBy?: 'title' | 'views' | 'created_at';
  }) => {
    const response = await api.get<ApiResponse<{ portfolios: Portfolio[]; pagination: any }>>('/portfolio', { params });
    return response.data.data!;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ portfolio: Portfolio }>>(`/portfolio/${id}`);
    return response.data.data!.portfolio;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<{ portfolio: Portfolio }>>(`/portfolio/slug/${slug}`);
    return response.data.data!.portfolio;
  },

  getFeatured: async (limit = 6) => {
    const response = await api.get<ApiResponse<{ portfolios: Portfolio[] }>>('/portfolio/featured', {
      params: { limit }
    });
    return response.data.data!.portfolios;
  },

  getCategories: async () => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/portfolio/categories');
    return response.data.data!.categories;
  },

  create: async (data: PortfolioRequest) => {
    const response = await api.post<ApiResponse<{ portfolio: Portfolio }>>('/portfolio', data);
    return response.data.data!.portfolio;
  },

  update: async (id: number, data: Partial<PortfolioRequest>) => {
    const response = await api.put<ApiResponse<{ portfolio: Portfolio }>>(`/portfolio/${id}`, data);
    return response.data.data!.portfolio;
  },

  toggleFeatured: async (id: number) => {
    const response = await api.patch<ApiResponse<{ portfolio: Portfolio }>>(`/portfolio/${id}/featured`);
    return response.data.data!.portfolio;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/portfolio/${id}`);
    return response.data;
  }
};

// Experience Services
export const experienceService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    current?: boolean;
    company?: string;
    orderBy?: 'company' | 'date';
  }) => {
    const response = await api.get<ApiResponse<{ experiences: Experience[]; pagination: any }>>('/experience', { params });
    return response.data.data!;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ experience: Experience }>>(`/experience/${id}`);
    return response.data.data!.experience;
  },

  getCurrent: async () => {
    const response = await api.get<ApiResponse<{ experience: Experience | null }>>('/experience/current');
    return response.data.data!.experience;
  },

  getTimeline: async (limit = 10) => {
    const response = await api.get<ApiResponse<{ timeline: Experience[] }>>('/experience/timeline', {
      params: { limit }
    });
    return response.data.data!.timeline;
  },

  getCompanies: async () => {
    const response = await api.get<ApiResponse<{ companies: string[] }>>('/experience/companies');
    return response.data.data!.companies;
  },

  getTechnologies: async () => {
    const response = await api.get<ApiResponse<{ technologies: string[] }>>('/experience/technologies');
    return response.data.data!.technologies;
  },

  create: async (data: any) => {
    const response = await api.post<ApiResponse<{ experience: Experience }>>('/experience', data);
    return response.data.data!.experience;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<ApiResponse<{ experience: Experience }>>(`/experience/${id}`, data);
    return response.data.data!.experience;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/experience/${id}`);
    return response.data;
  }
};

// Upload Services
export const uploadService = {
  uploadSingle: async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<{ file: FileUpload }>>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.file;
  },

  uploadMultiple: async (files: File[]): Promise<FileUpload[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post<ApiResponse<{ files: FileUpload[] }>>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.files;
  },

  uploadAvatar: async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<ApiResponse<{ avatar: FileUpload }>>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.avatar;
  },

  uploadPortfolioImage: async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<ApiResponse<{ image: FileUpload }>>('/upload/portfolio-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.image;
  },

  deleteFile: async (filename: string, type: 'images' | 'documents' = 'images') => {
    const response = await api.delete<ApiResponse>(`/upload/${filename}`, {
      params: { type }
    });
    return response.data;
  },

  getFileInfo: async (filename: string, type: 'images' | 'documents' = 'images') => {
    const response = await api.get<ApiResponse<any>>(`/upload/${filename}`, {
      params: { type }
    });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<{ stats: any }>>('/upload/stats');
    return response.data.data!.stats;
  }
};

// Blog Services
export const blogService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published';
    category?: string;
    tag?: string;
    search?: string;
    orderBy?: 'title' | 'views' | 'publish_date';
  }) => {
    const response = await api.get<ApiResponse<{ blogs: any[]; pagination: any }>>('/blog', { params });
    return response.data.data!;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ blog: any }>>(`/blog/${id}`);
    return response.data.data!.blog;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<{ blog: any }>>(`/blog/slug/${slug}`);
    return response.data.data!.blog;
  },

  getCategories: async () => {
    const response = await api.get<ApiResponse<{ categories: string[] }>>('/blog/categories');
    return response.data.data!.categories;
  },

  getTags: async () => {
    const response = await api.get<ApiResponse<{ tags: string[] }>>('/blog/tags');
    return response.data.data!.tags;
  },

  create: async (data: any) => {
    const response = await api.post<ApiResponse<{ blog: any }>>('/blog', data);
    return response.data.data!.blog;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<ApiResponse<{ blog: any }>>(`/blog/${id}`, data);
    return response.data.data!.blog;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/blog/${id}`);
    return response.data;
  },

  incrementViews: async (id: number) => {
    const response = await api.patch<ApiResponse<{ views: number }>>(`/blog/${id}/views`);
    return response.data.data!.views;
  }
};

// Testimonial Services
export const testimonialService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'rejected';
    featured?: boolean;
    rating?: number;
    company?: string;
    projectType?: string;
    search?: string;
    orderBy?: 'rating' | 'name' | 'company' | 'sort_order';
  }) => {
    const response = await api.get<ApiResponse<{ testimonials: any[]; pagination: any }>>('/testimonials', { params });
    return response.data.data!;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ testimonial: any }>>(`/testimonials/${id}`);
    return response.data.data!.testimonial;
  },

  getStats: async () => {
    const response = await api.get<ApiResponse<{ stats: any }>>('/testimonials/stats');
    return response.data.data!.stats;
  },

  getCompanies: async () => {
    const response = await api.get<ApiResponse<{ companies: string[] }>>('/testimonials/companies');
    return response.data.data!.companies;
  },

  getProjectTypes: async () => {
    const response = await api.get<ApiResponse<{ projectTypes: string[] }>>('/testimonials/project-types');
    return response.data.data!.projectTypes;
  },

  create: async (data: any) => {
    const response = await api.post<ApiResponse<{ testimonial: any }>>('/testimonials', data);
    return response.data.data!.testimonial;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<ApiResponse<{ testimonial: any }>>(`/testimonials/${id}`, data);
    return response.data.data!.testimonial;
  },

  toggleFeatured: async (id: number) => {
    const response = await api.patch<ApiResponse<{ testimonial: any }>>(`/testimonials/${id}/featured`);
    return response.data.data!.testimonial;
  },

  approve: async (id: number) => {
    const response = await api.patch<ApiResponse<{ testimonial: any }>>(`/testimonials/${id}/approve`);
    return response.data.data!.testimonial;
  },

  reject: async (id: number) => {
    const response = await api.patch<ApiResponse<{ testimonial: any }>>(`/testimonials/${id}/reject`);
    return response.data.data!.testimonial;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/testimonials/${id}`);
    return response.data;
  }
};

