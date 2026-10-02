import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tag-types";
import type {
  CreatePatientPayload,
  PatientsQueryParams,
  PatientsResponse,
  TPatient,
} from "@/types/patient";
import type { TResponse } from "@/types/global";

const URL = "/patients";

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPatient: builder.mutation<TResponse<Omit<TPatient, "doctor">>, CreatePatientPayload>({
      query: (body) => ({ url: URL, method: "POST", body }),
      invalidatesTags: [tagTypes.patient, tagTypes.doctor],
    }),
    getPatients: builder.query<PatientsResponse, PatientsQueryParams>({
      query: (params) => ({ url: URL, method: "GET", params }),
      providesTags: [tagTypes.patient],
    }),
  }),
});

export const { useGetPatientsQuery, useCreatePatientMutation } = patientApi;
