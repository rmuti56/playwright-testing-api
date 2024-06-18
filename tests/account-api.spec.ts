import test, { expect } from "@playwright/test";

const BASE_URL = "https://automationexercise.com";

test.use({
  baseURL: BASE_URL,
});

test.describe("My Account", () => {
  const accountPayload = {
    name: "Chok",
    email: "chok.watcharathep+2@maqe.com",
    password: "password",
    title: "Mr",
    birth_date: "06",
    birth_month: "05",
    birth_year: "1995",
    firstname: "Watcharathep",
    lastname: "Khamnuthai",
    company: "MAQE",
    address1: "Address 1",
    address2: "Address 2",
    country: "Country",
    zipcode: "10000",
    state: "State",
    city: "City",
    mobile_number: "0999999999",
  };
  test.beforeAll(async ({ request }) => {
    // create account
    const createAccountResponse = await request.post("/api/createAccount", {
      multipart: accountPayload,
    });
    const response = await createAccountResponse.json();
    expect(response.responseCode).toEqual(201);
    expect(response.message).toEqual("User created!");
  });

  test.afterAll(async ({ request }) => {
    // delete account
    const deleteAccountResponse = await request.delete("/api/deleteAccount", {
      multipart: {
        email: accountPayload.email,
        password: accountPayload.password,
      },
    });
    const response = await deleteAccountResponse.json();
    expect(response.responseCode).toEqual(200);
    expect(response.message).toEqual("Account deleted!");
  });

  test("Verify Login with valid detail", async ({ request }) => {
    const loginResponse = await request.post("/api/verifyLogin", {
      multipart: {
        email: accountPayload.email,
        password: accountPayload.password,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    expect(loginResponse.status()).toEqual(200);
    const response = await loginResponse.json();
    expect(response.responseCode).toEqual(200);
    expect(response.message).toEqual("User exists!");
  });

  test("Verify Login without email parameter", async ({ request }) => {
    const loginResponse = await request.post("/api/verifyLogin", {
      multipart: {
        password: accountPayload.password,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    expect(loginResponse.status()).toEqual(200);
    const response = await loginResponse.json();
    expect(response.responseCode).toEqual(400);
    expect(response.message).toEqual(
      "Bad request, email or password parameter is missing in POST request."
    );
  });

  test("Verify Login with invalid details", async ({ request }) => {
    const loginResponse = await request.post("/api/verifyLogin", {
      multipart: {
        email: `${accountPayload.email}mm`,
        password: `${accountPayload.password}dd`,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    expect(loginResponse.status()).toEqual(200);
    const response = await loginResponse.json();
    expect(response.responseCode).toEqual(404);
    expect(response.message).toEqual("User not found!");
  });

  test("Update user account", async ({ request }) => {
    // update payload
    accountPayload.name = `${accountPayload.name} updated`;
    accountPayload.firstname = `${accountPayload.firstname} updated`;
    accountPayload.lastname = `${accountPayload.lastname} updated`;

    const updateAccountResponse = await request.put("/api/updateAccount", {
      multipart: accountPayload,
    });
    expect(updateAccountResponse.ok()).toBeTruthy();
    expect(updateAccountResponse.status()).toEqual(200);
    const response = await updateAccountResponse.json();
    expect(response.responseCode).toEqual(200);
    expect(response.message).toEqual("User updated!");
  });

  test("GET user account detail by email", async ({ request }) => {
    // update payload
    const getAccountResponse = await request.get("/api/getUserDetailByEmail", {
      params: {
        email: accountPayload.email,
      },
    });
    expect(getAccountResponse.ok()).toBeTruthy();
    expect(getAccountResponse.status()).toEqual(200);
    const response = await getAccountResponse.json();
    expect(response.responseCode).toEqual(200);
    const user = response.user;
    expect({
      email: user.email,
      name: user.name,
      firstname: user.first_name,
      lastname: user.last_name,
    }).toEqual(
      expect.objectContaining({
        email: accountPayload.email,
        name: accountPayload.name,
        firstname: accountPayload.firstname,
        lastname: accountPayload.lastname,
      })
    );
  });
});
