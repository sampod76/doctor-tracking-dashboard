import { tagTypes } from "@/redux/tag-types";
import { baseApi } from "../../api/baseApi";
import type { DoctorFormValues, DoctorsQueryParams, DoctorsResponse, TDoctor } from "@/types/doctor";
const URL = "/doctors";

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<DoctorsResponse, DoctorsQueryParams>({
      query: (params) => ({ url:URL, method: "GET", params }),
      providesTags:[tagTypes.doctor]
    }),
    createDoctorAccount: builder.mutation<TDoctor, DoctorFormValues>({
  query: (body) => ({
    url: URL,
    method: "POST",
    body,
  }),
  invalidatesTags: [tagTypes.doctor],
}),
    
  }),
});

export const { useGetDoctorsQuery,  useCreateDoctorAccountMutation, } = doctorApi;
