export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/auth";
};

export const getOnlyBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_ONLY_BASE_URL || "http://localhost:5000";
};
export const getSocketBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_SOCKET_BASEURL || "http://localhost:5001";
};

export const getCloudinaryEnv = (): {
  upload_preset: string;
  cloud_name: string;
} => {
  return {
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "mvfmecoi",
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "duyfxtcdd",
  };
};
