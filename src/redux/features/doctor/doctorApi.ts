import { baseApi } from "../../api/baseApi";
import type { DoctorsQueryParams, DoctorsResponse } from "@/types/doctor";

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<DoctorsResponse, DoctorsQueryParams>({
      query: (params) => ({ url: "/doctors", method: "GET", params }),
    }),
  }),
});

export const { useGetDoctorsQuery } = doctorApi;
