const request = require("supertest");
const app = require("../app");
const Service = require("../models/Service.model");

describe("Service Routes", () => {
    it("should get all services", async () => {
        const response = await request(app).get("/api/services");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("services");
        expect(response.body.services).toBeInstanceOf(Array);
    })

    it("should return 500 if database error", async () => {
        jest.spyOn(Service, "find").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).get("/api/services");
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Database error");
    })
})