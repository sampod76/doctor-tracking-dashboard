/* eslint-disable @typescript-eslint/no-explicit-any */
import { TMeta } from '@/types';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { instance as axiosInstance } from './axiosInstance';

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string;
      method: AxiosRequestConfig['method'];
      data?: AxiosRequestConfig['data'];
      params?: AxiosRequestConfig['params'];
      meta?: TMeta;
      contentType?: string;
      withCredentials?: boolean;
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, contentType, withCredentials = true }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        timeout: 300000,
        headers: {
          'Content-Type': contentType || 'application/json',
        },
        withCredentials,
      });
      return result;
    } catch (axiosError) {
      const err = axiosError as AxiosError & {
        statusCode: number;
        message: string;
        success: boolean;
        errorMessages: Array<any>;
      };

      const error = {
        status: err.response?.status || err?.statusCode || 400,
        data: err.response?.data || err.message,
        message: err.response?.data || err.message,
        success: err?.success,
        errorMessages: err?.errorMessages,
      };
      return {
        error: error,
      };
    }
  };
