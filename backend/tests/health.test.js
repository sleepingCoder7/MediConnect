const request = require("supertest");
const app = require("../app");

describe("Health Check", () => {
    it("should return 200 OK", async () => {
        const response = await request(app).get("/health");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("status", "OK");
        expect(response.body).toHaveProperty("uptime_human");
        expect(response.body).toHaveProperty("uptime_seconds");
        expect(response.body).toHaveProperty("timestamp");
    });

    it("should return correct uptime format", async () => {
        const response = await request(app).get("/health");
        const uptime = response.body.uptime_human;

        expect(uptime).toMatch(/\d+h \d+m \d+s/);
    });

    it("should return uptime in seconds", async () => {
        const response = await request(app).get("/health");
        const uptime = response.body.uptime_seconds;

        expect(uptime).toBeGreaterThan(0);
    });
});