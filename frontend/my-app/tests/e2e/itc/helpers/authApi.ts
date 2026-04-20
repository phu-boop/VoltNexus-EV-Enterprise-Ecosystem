import { APIRequestContext, expect } from "@playwright/test";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult = {
  token: string;
  roles: string[];
  raw: any;
};

const API_BASE_URL = process.env.PW_API_BASE_URL || "http://localhost:8080";

export const testAccounts = {
  admin: {
    email: process.env.PW_ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.PW_ADMIN_PASSWORD || "123123123",
  },
  evmStaff: {
    email: process.env.PW_EVM_STAFF_EMAIL || "StafffEVM@gmail.com",
    password: process.env.PW_EVM_STAFF_PASSWORD || "123123123",
  },
  dealerManager: {
    email: process.env.PW_DEALER_MANAGER_EMAIL || "Anhphu@gmail.com",
    password: process.env.PW_DEALER_MANAGER_PASSWORD || "123123123",
  },
  dealerStaff: {
    email: process.env.PW_DEALER_STAFF_EMAIL || "StaffPhu@gmail.com",
    password: process.env.PW_DEALER_STAFF_PASSWORD || "123123123",
  },
};

export async function loginByApi(
  request: APIRequestContext,
  payload: LoginPayload,
): Promise<LoginResult> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: payload.email,
      password: payload.password,
      captchaToken: "dummy-token-for-test",
    },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(String(body?.code)).toBe("1000");

  const token = body?.data?.token;
  const userRoles = (body?.data?.userRespond?.roles || []).map(
    (r: any) => r.name || r,
  );

  return {
    token,
    roles: userRoles,
    raw: body,
  };
}

export async function callWithAuth(
  request: APIRequestContext,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  token?: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return request.fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
  });
}
