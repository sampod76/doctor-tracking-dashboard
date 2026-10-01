import type { TMeta, TResponse } from "./global";

// Mirror the existing server enums; this client has no shared server package.
export enum ENUM_GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum TREATMENT_STATUS {
  ACTIVE = "ACTIVE",
  UNDER_OBSERVATION = "UNDER_OBSERVATION",
  RECOVERED = "RECOVERED",
}

export type TPatient = {
  _id: string;
  name: string;
  phone: string;
  doctorId: string;
  age: number;
  gender: ENUM_GENDER;
  treatmentStatus: TREATMENT_STATUS;
  lastVisitAt: string | null;
  followUpDate: string | null;
  createdAt: string;
};

export const PATIENT_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "followUpDate",
  "lastVisitAt",
  "age",
] as const;
export type PatientSortBy = (typeof PATIENT_SORT_FIELDS)[number];
export type PatientSortOrder = "asc" | "desc";

export type PatientsQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: PatientSortBy;
  sortOrder?: PatientSortOrder;
  doctorId?: string;
  gender?: ENUM_GENDER;
  treatmentStatus?: TREATMENT_STATUS;
  followUpDate?: string;
  lastVisitAt?: string;
};

export type PatientsResponse = TResponse<TPatient[]> & {
  data: TPatient[];
  meta: TMeta;
};
