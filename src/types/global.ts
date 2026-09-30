/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseQueryApi } from "@reduxjs/toolkit/query";

export type TError = {
  data: {
    errorSources: never[];
    message: string;
    stack: string;
    errorMessage: {
      path: string;
      message: string;
    };
    success: boolean;
  };
  status: number;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  data?: T;
  error?: TError;
  meta?: TMeta;
  success: boolean;
  message: string;
  statusCode?: number;
};

export type TResponseRedux<T> = TResponse<T> & BaseQueryApi;

export type TQueryParam = {
  name: string;
  value: boolean | React.Key;
};

export type TArgsParam = Record<string, any>;

export interface ErrorSource {
  path: string;
  message: string;
}

export interface ErrorResponseData {
  status: boolean;
  message: string;
  errorSources: ErrorSource[];
  stack?: string;
}

export interface ErrorResponse {
  data: ErrorResponseData;
  status: boolean;
}

export type IImagePlatform = "imgbb" | "cloudinary" | "server" | "aws" | string;
export const I_IMAGE_PLATFORM_ARRAY = ["imgbb", "cloudinary", "server", "aws"];

export interface TFileDocument {
  id?: string | null;
  mimetype?: string;
  server_url?: string;
  filename?: string;
  originalUrl?: string;
  pre_url?: string;
  modifyFileName?: string;
  path?: string;
  url?: string;
  fileUniqueId?: string;
  platform?: IImagePlatform;
  file_type?: string;
  cdn?: string;
  size?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  caption_title?: string;
  thumb_image_size?: ThumbImageSize;
  large_image_size?: LargeImageSize;
  small_image_size?: SmallImageSize;
  medium_image_size?: MediumImageSize;
}



export interface ThumbImageSize {
  width: number;
  height: number;
}

export interface LargeImageSize {
  width: number;
  height: number;
}

export interface SmallImageSize {
  width: number;
  height: number;
}

export interface MediumImageSize {
  width: number;
  height: number;
}

export interface SidebarData {
  title: string;
  key: string;
  items: SidebarItem[];
}
export interface SidebarItem {
  title: string;
  url?: string;
  key: string;
  icon?: React.ComponentType;
  items?: SidebarItem[];
  allowedRoles?: string[];
  permission?: string;
}