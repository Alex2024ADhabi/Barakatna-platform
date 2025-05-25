// core/apiClient.ts

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse, QueryParams } from "./types";
import { API_BASE_URL } from '../../../config/api'
// Initialize Axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Utility to format query params
const toQueryString = (params: QueryParams = {}) => {
  return new URLSearchParams(params as Record<string, string>).toString();
};

// Attach language header if provided
const getHeaders = (language?: string): Record<string, string> => {
  return language ? { "Accept-Language": language } : {};
};

// Unified API Client
export const apiClient = {
  get: async <T>(
    url: string,
    params: QueryParams = {},
    language?: string
  ): Promise<ApiResponse<T>> => {
    const config: AxiosRequestConfig = {
      headers: getHeaders(language),
      params,
    };
    const response: AxiosResponse<T> = await instance.get(url, config);
    return { data: response.data, status: response.status };
  },

  post: async <T>(
    url: string,
    data: any,
    language?: string
  ): Promise<ApiResponse<T>> => {
    const config: AxiosRequestConfig = {
      headers: getHeaders(language),
    };
    const response: AxiosResponse<T> = await instance.post(url, data, config);
    return { data: response.data, status: response.status };
  },

  put: async <T>(
    url: string,
    data: any,
    language?: string
  ): Promise<ApiResponse<T>> => {
    const config: AxiosRequestConfig = {
      headers: getHeaders(language),
    };
    const response: AxiosResponse<T> = await instance.put(url, data, config);
    return { data: response.data, status: response.status };
  },

  delete: async <T>(
    url: string,
    language?: string
  ): Promise<ApiResponse<T>> => {
    const config: AxiosRequestConfig = {
      headers: getHeaders(language),
    };
    const response: AxiosResponse<T> = await instance.delete(url, config);
    return { data: response.data, status: response.status };
  },
};
