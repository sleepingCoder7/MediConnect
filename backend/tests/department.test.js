const request = require("supertest");
const app = require("../app");
const Department = require("../models/Department.model");

describe("Department Routes", () => {
    it("should get all departments", async () => {
        const response = await request(app).get("/api/departments");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("departments");
    })

    it("should handle error", async () => {
        jest.spyOn(Department, "find").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).get("/api/departments");
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Database error");
    })
})