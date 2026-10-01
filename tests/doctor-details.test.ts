import assert from "node:assert/strict";
import { test } from "node:test";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../src/redux/api/baseApi";
import authReducer from "../src/redux/features/auth/authSlice";
import { doctorApi } from "../src/redux/features/doctor/doctorApi";
import { patientApi } from "../src/redux/features/patient/patientApi";
import { ENUM_GENDER, TREATMENT_STATUS } from "../src/types/patient";

test("doctor detail and scoped patient queries keep independent cache entries", async () => {
  const originalFetch = globalThis.fetch;
  const requests: URL[] = [];
  const id = "6abe56bb75b73e67a5efdc01";
  const store = configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  const profile = { success: true, message: "", data: { _id: id, name: "Test Doctor" } };
  globalThis.fetch = async (input) => {
    const request = input as Request;
    assert.equal(request.method, "GET");
    const url = new URL(request.url);
    requests.push(url);
    return new Response(
      JSON.stringify(
        url.pathname.endsWith(`/doctors/${id}`)
          ? profile
          : { success: true, message: "", data: [], meta: { page: 1, limit: 10, total: 0 } },
      ),
      { headers: { "Content-Type": "application/json" } },
    );
  };
  try {
    const detail = store.dispatch(doctorApi.endpoints.getDoctorById.initiate(id));
    assert.deepEqual(await detail.unwrap(), profile);
    const defaults = {
      doctorId: id,
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    };
    await store.dispatch(patientApi.endpoints.getPatients.initiate(defaults)).unwrap();
    const filtered = {
      ...defaults,
      page: 2,
      limit: 20,
      searchTerm: "Olivia",
      gender: ENUM_GENDER.FEMALE,
      treatmentStatus: TREATMENT_STATUS.ACTIVE,
      followUpDate: "2026-10-02",
      lastVisitAt: "2026-10-01",
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    };
    await store.dispatch(patientApi.endpoints.getPatients.initiate(filtered)).unwrap();
    await store.dispatch(patientApi.endpoints.getPatients.initiate(defaults)).unwrap();
    assert.equal(requests[0].pathname, `/api/v1/doctors/${id}`);
    assert.equal(requests[0].search, "");
    assert.deepEqual(
      Object.fromEntries(requests[1].searchParams),
      Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, String(value)])),
    );
    assert.deepEqual(
      Object.fromEntries(requests[2].searchParams),
      Object.fromEntries(Object.entries(filtered).map(([key, value]) => [key, String(value)])),
    );
    assert.equal(
      requests.length,
      3,
      "changing patients must not refetch the doctor or an already cached patient query",
    );
    assert.deepEqual(doctorApi.endpoints.getDoctorById.select(id)(store.getState()).data, profile);
  } finally {
    store.dispatch(baseApi.util.resetApiState());
    globalThis.fetch = originalFetch;
  }
});
