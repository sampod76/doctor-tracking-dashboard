import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";
import type { PatientsQueryParams, PatientsResponse } from "@/types/patient";

const URL = "/patients";

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PatientsResponse, PatientsQueryParams>({
      query: (params) => ({ url: URL, method: "GET", params }),
      providesTags: [tagTypes.patient],
    }),
  }),
});

export const { useGetPatientsQuery } = patientApi;
