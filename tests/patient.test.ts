import assert from "node:assert/strict";
import { test } from "node:test";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../src/redux/api/baseApi";
import authReducer from "../src/redux/features/auth/authSlice";
import { doctorApi } from "../src/redux/features/doctor/doctorApi";
import { patientApi } from "../src/redux/features/patient/patientApi";
import { ENUM_GENDER, TREATMENT_STATUS, type PatientsQueryParams } from "../src/types/patient";

test("patient and doctor list request contracts and cache sharing", async () => {
  const originalFetch = globalThis.fetch;
  const requests: URL[] = [];
  const store = configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });
  const payload = {
    success: true,
    statusCode: 200,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, total: 0 },
  };
  globalThis.fetch = async (input) => {
    const request = input as Request;
    assert.equal(request.method, "GET");
    requests.push(new URL(request.url));
    return new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const params: PatientsQueryParams = {
      page: 2,
      limit: 20,
      searchTerm: "Olivia",
      sortBy: "followUpDate",
      sortOrder: "asc",
      doctorId: "507f1f77bcf86cd799439011",
      gender: ENUM_GENDER.OTHER,
      treatmentStatus: TREATMENT_STATUS.UNDER_OBSERVATION,
      followUpDate: "2026-10-02",
      lastVisitAt: "2026-10-01",
    };
    assert.deepEqual(
      await store.dispatch(patientApi.endpoints.getPatients.initiate(params)).unwrap(),
      payload,
    );
    assert.equal(requests[0].pathname, "/api/v1/patients");
    assert.deepEqual(
      Object.fromEntries(requests[0].searchParams),
      Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    );

    await store
      .dispatch(
        patientApi.endpoints.getPatients.initiate({
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      )
      .unwrap();
    assert.deepEqual(Object.fromEntries(requests[1].searchParams), {
      page: "1",
      limit: "10",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    // Concurrent desktop/drawer consumers share the same remote doctor request.
    await Promise.all([
      store.dispatch(doctorApi.endpoints.getDoctors.initiate({ page: 1, limit: 10 })).unwrap(),
      store.dispatch(doctorApi.endpoints.getDoctors.initiate({ page: 1, limit: 10 })).unwrap(),
    ]);
    assert.equal(requests.length, 3);
    assert.equal(requests[2].pathname, "/api/v1/doctors");
    assert.deepEqual(Object.fromEntries(requests[2].searchParams), { page: "1", limit: "10" });
    await store
      .dispatch(doctorApi.endpoints.getDoctors.initiate({ page: 1, limit: 10, searchTerm: "oli" }))
      .unwrap();
    assert.deepEqual(Object.fromEntries(requests[3].searchParams), {
      page: "1",
      limit: "10",
      searchTerm: "oli",
    });
    await store.dispatch(doctorApi.endpoints.getDoctors.initiate({ page: 1, limit: 10 })).unwrap();
    assert.equal(requests.length, 4);
  } finally {
    globalThis.fetch = originalFetch;
    store.dispatch(baseApi.util.resetApiState());
  }
});
