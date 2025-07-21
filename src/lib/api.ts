import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { APIResponse, QueryParams, APIError } from '@/types';
import { withRetry, DEFAULT_RETRY_CONFIG, reportError } from './error-handling';

class StrapiAPI {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const apiError: APIError = {
          status: error.response?.status || 500,
          name: error.response?.data?.error?.name || 'Unknown Error',
          message: error.response?.data?.error?.message || error.message,
          details: error.response?.data?.error?.details,
        };
        
        // Report error for monitoring
        reportError(new Error(apiError.message), {
          endpoint: error.config?.url,
          method: error.config?.method,
          status: apiError.status,
          details: apiError.details,
        });
        
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('strapi_jwt');
    }
    return null;
  }

  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();

    // Handle populate
    if (params.populate) {
      if (Array.isArray(params.populate)) {
        params.populate.forEach(field => {
          searchParams.append('populate', field);
        });
      } else {
        searchParams.append('populate', params.populate);
      }
    }

    // Handle filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([operator, operatorValue]) => {
            searchParams.append(`filters[${key}][${operator}]`, String(operatorValue));
          });
        } else {
          searchParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    // Handle sort
    if (params.sort) {
      if (Array.isArray(params.sort)) {
        params.sort.forEach(field => {
          searchParams.append('sort', field);
        });
      } else {
        searchParams.append('sort', params.sort);
      }
    }

    // Handle pagination
    if (params.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(`pagination[${key}]`, String(value));
        }
      });
    }

    // Handle fields
    if (params.fields) {
      params.fields.forEach(field => {
        searchParams.append('fields', field);
      });
    }

    // Handle locale
    if (params.locale) {
      searchParams.append('locale', params.locale);
    }

    return searchParams.toString();
  }

  async get<T>(endpoint: string, params?: QueryParams, retryConfig?: Partial<typeof DEFAULT_RETRY_CONFIG>): Promise<APIResponse<T>> {
    return withRetry(async () => {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      const response = await this.client.get<APIResponse<T>>(url);
      return response.data;
    }, retryConfig);
  }

  async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig, retryConfig?: Partial<typeof DEFAULT_RETRY_CONFIG>): Promise<APIResponse<T>> {
    return withRetry(async () => {
      const response = await this.client.post<APIResponse<T>>(endpoint, data, config);
      return response.data;
    }, retryConfig);
  }

  async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig, retryConfig?: Partial<typeof DEFAULT_RETRY_CONFIG>): Promise<APIResponse<T>> {
    return withRetry(async () => {
      const response = await this.client.put<APIResponse<T>>(endpoint, data, config);
      return response.data;
    }, retryConfig);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig, retryConfig?: Partial<typeof DEFAULT_RETRY_CONFIG>): Promise<APIResponse<T>> {
    return withRetry(async () => {
      const response = await this.client.delete<APIResponse<T>>(endpoint, config);
      return response.data;
    }, retryConfig);
  }

  // Helper method to get media URL
  getMediaUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return `${strapiUrl}${url}`;
  }
}

// Create singleton instance
export const api = new StrapiAPI();

// Export the class for testing purposes
export { StrapiAPI };