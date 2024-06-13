import { expect, test } from "@playwright/test";
import { faker } from "@faker-js/faker";

const PRODUCT_PATH = "/api/v1/products";



test.describe("Product Management", { tag: "@manage" }, () => {
  const payload = {
    id: undefined as unknown as string,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
  };

  test.beforeAll(async ({ request }) => {
    // create a new product
    const newProductResponse = await request.post(PRODUCT_PATH, {
      data: payload,
    });
    expect(newProductResponse.ok()).toBeTruthy();
    expect(newProductResponse.status()).toEqual(201);
    const newProduct = await newProductResponse.json();
    payload.id = newProduct.id;
    expect(newProduct).toEqual(expect.objectContaining(payload));
  });

  test.afterAll(async ({ request }) => {
    // delete product by id
    const deleteResponse = await request.delete(
      `${PRODUCT_PATH}/${payload.id}`
    );
    expect(deleteResponse.ok()).toBeTruthy();
    expect(deleteResponse.status()).toEqual(200);
  });

  test("should be able to update the product price by id", async ({
    request,
  }) => {
    const newPrice = faker.commerce.price();
    const productResponse = await request.patch(
      `${PRODUCT_PATH}/${payload.id}`,
      {
        data: {
          price: newPrice,
        },
      }
    );
    expect(productResponse.ok()).toBeTruthy();
    expect(productResponse.status()).toEqual(200);
    const product = await productResponse.json();
    expect(product.price).toEqual(newPrice);
  });

  test("should be able to get product by id", async ({ request }) => {
    const productResponse = await request.get(`${PRODUCT_PATH}/${payload.id}`);
    expect(productResponse.ok()).toBeTruthy();
    expect(productResponse.status()).toEqual(200);
    const product = await productResponse.json();
    expect(product.id).toEqual(payload.id);
  });

  test("should be able to update the product information by id", async ({
    request,
  }) => {
    const newPayload = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price(),
    };
    const productResponse = await request.put(`${PRODUCT_PATH}/${payload.id}`, {
      data: newPayload,
    });
    expect(productResponse.ok()).toBeTruthy();
    expect(productResponse.status()).toEqual(200);
    const product = await productResponse.json();
    expect(product).toEqual(
      expect.objectContaining({
        id: payload.id,
        ...newPayload,
      })
    );
  });
});

test.describe("Product Filtering", { tag: "@filter" }, () => {
  const payload = {
    id: undefined as unknown as string,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
  };

  test.beforeAll(async ({ request }) => {
    // create a new product
    const newProductResponse = await request.post(PRODUCT_PATH, {
      data: payload,
    });
    expect(newProductResponse.ok()).toBeTruthy();
    expect(newProductResponse.status()).toEqual(201);
    const newProduct = await newProductResponse.json();
    payload.id = newProduct.id;
    expect(newProduct).toEqual(expect.objectContaining(payload));
  });

  test.afterAll(async ({ request }) => {
    // delete product by id
    const deleteResponse = await request.delete(
      `${PRODUCT_PATH}/${payload.id}`
    );
    expect(deleteResponse.ok()).toBeTruthy();
    expect(deleteResponse.status()).toEqual(200);
  });

  test("should be able to set page side", async ({ request, baseURL }) => {
    const path = new URL(`${baseURL}${PRODUCT_PATH}`);
    path.searchParams.append("page", "1");
    path.searchParams.append("limit", "5");
    // /api/v1/products?page=1&limit=5
    const productsResponse = await request.get(path.toString());
    expect(productsResponse.ok()).toBeTruthy();
    expect(productsResponse.status()).toEqual(200);
    const products: [] = await productsResponse.json();
    expect(products.length).toBeLessThanOrEqual(5);
  });

  test("should be able to filter products by name", async ({
    request,
    baseURL,
  }) => {
    const path = new URL(`${baseURL}${PRODUCT_PATH}`);
    path.searchParams.append("name", payload.name);
    const productsResponse = await request.get(path.toString());
    expect(productsResponse.ok()).toBeTruthy();
    expect(productsResponse.status()).toEqual(200);
    const products: any[] = await productsResponse.json();
    expect(products.map((product) => product.name)).toEqual(
      expect.arrayContaining([payload.name])
    );
  });
});
