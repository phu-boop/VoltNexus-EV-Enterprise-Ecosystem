import { expect, test } from "@playwright/test";
import { callWithAuth, loginByApi, testAccounts } from "../helpers/authApi";

const endpoints = {
  authLogout: "/auth/logout",
  dealersList: "/dealers/api/dealers",
  systemUsersList: "/users",
};

test.describe("ITC Smoke - Auth & Access", () => {
  test("ITC_1.1 login successfully with valid credentials", async ({
    request,
  }) => {
    const login = await loginByApi(request, testAccounts.admin);

    expect(login.token).toBeTruthy();
    expect(Array.isArray(login.roles)).toBeTruthy();
    expect(login.roles.length).toBeGreaterThan(0);
  });

  test("ITC_1.2 login fails with wrong password", async ({ request }) => {
    const response = await request.post("http://localhost:8080/auth/login", {
      data: {
        email: testAccounts.admin.email,
        password: "WrongPassword",
        captchaToken: "dummy-token-for-test",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("ITC_2.2 logout fails without token", async ({ request }) => {
    const response = await callWithAuth(request, "POST", endpoints.authLogout);

    expect(response.status()).toBe(401);
  });

  test("ITC_6.1 list dealers success with admin", async ({ request }) => {
    const admin = await loginByApi(request, testAccounts.admin);
    const response = await callWithAuth(
      request,
      "GET",
      endpoints.dealersList,
      admin.token,
    );

    expect(response.status()).toBe(200);
  });

  test("ITC_6.2 list dealers forbidden with dealer staff", async ({
    request,
  }) => {
    const dealerStaff = await loginByApi(request, testAccounts.dealerStaff);
    const response = await callWithAuth(
      request,
      "GET",
      endpoints.dealersList,
      dealerStaff.token,
    );

    expect(response.status()).toBe(403);
  });

  test("ITC_6.3 list dealers without token", async ({ request }) => {
    const response = await callWithAuth(request, "GET", endpoints.dealersList);

    expect(response.status()).toBe(401);
  });

  test("ITC_18.1 list system users success with admin", async ({ request }) => {
    const admin = await loginByApi(request, testAccounts.admin);
    const response = await callWithAuth(
      request,
      "GET",
      endpoints.systemUsersList,
      admin.token,
    );

    expect(response.status()).toBe(200);
  });

  test("ITC_18.2 list system users forbidden with evm staff", async ({
    request,
  }) => {
    const evmStaff = await loginByApi(request, testAccounts.evmStaff);
    const response = await callWithAuth(
      request,
      "GET",
      endpoints.systemUsersList,
      evmStaff.token,
    );

    expect(response.status()).toBe(403);
  });
});
