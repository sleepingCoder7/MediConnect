const request = require("supertest");
const app = require("../app");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

let testEmail = `test${Date.now()}@mail.com`;
let testGoogleEmail = `google${Date.now()}@mail.com`;

jest.mock("../utils/googleAuth");
const mockVerifyGoogleToken = require("../utils/googleAuth");
const { logoutUser } = require("../controllers/authController");

mockVerifyGoogleToken.mockImplementation((token) => {
    if(token === "invalid-token"){
        return Promise.resolve(null);
    }
    return Promise.resolve({
        email: testGoogleEmail,
        name: "Google User",
        picture: "https://example.com/google.jpg"
    });
});

describe("Auth Routes", () => {
    it("should register a user", async () => {
        const response = await request(app).post("/api/auth/register").send({
            name: "John Doe",
            email: testEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
    });

    it("should not register a user if user already exists", async () => {
        const response = await request(app).post("/api/auth/register").send({
            name: "John Doe",
            email: testEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(400);
    });

    it("should handle register error", async () => {
        jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).post("/api/auth/register").send({
            name: "John Doe",
            email: testEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(500);
    })

    it("should login a user", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"][0]).toContain("token=");
        expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
        expect(response.headers["set-cookie"][0]).toContain("Secure");
        expect(response.headers["set-cookie"][0]).toContain("SameSite=Strict");
        expect(response.headers["set-cookie"][0]).toMatch(/Max-Age=\d+/);
    });

    it("should handle login error", async () => {
        jest.spyOn(User, "findOne").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(500);
    })

    it("should get user profile", async () => {
        //Login
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/auth/me").set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("profile");
        expect(response.body.user).toHaveProperty("address");
        expect(response.body.user).toHaveProperty("profilePic");

    });

    it("should handle get user profile error", async () => {
        jest.spyOn(User, "findById").mockReturnValueOnce({
            select: jest.fn().mockRejectedValueOnce(new Error("Database error"))
        });
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/auth/me").set("Cookie", cookies);
        expect(response.statusCode).toBe(500);
    })

    it("should handle missing token", async () => {
        const response = await request(app).get("/api/auth/me").set("Cookie", "");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Unauthorized");
    })

    it("should handle invalid token", async () => {
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
            throw new Error("Invalid token");
        });
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/auth/me").set("Cookie", cookies);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Invalid token");
    })

    it("should handle blocked origin header", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/auth/me").set("Cookie", cookies).set("Origin", "http://localhost:3000");
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Blocked by CSRF Protection(Invalid Origin)");
    })

    it("should not login a user if user does not exist", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: "nonexistent@mail.com",
            password: "password"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("User with this email does not exist");
    });

    it("should not login a user if password is incorrect", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "wrongpassword"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Incorrect password");
    });

    it("should logout a user", async () => {
        //Login
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/auth/logout").set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Logout successful");
    });

    it("should handle logout error", async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            clearCookie: jest.fn().mockImplementation(() => {
                throw new Error("Cookie clearing failed");
            }),
        };
        await logoutUser(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cookie clearing failed"
        });
    })


    it("should login with google and create new user if not exists", async () => {
        const response = await request(app).post("/api/auth/google").send({
            token: "mock-google-token"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"][0]).toContain("token=");
        expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
        expect(response.headers["set-cookie"][0]).toContain("Secure");
        expect(response.headers["set-cookie"][0]).toContain("SameSite=Strict");
        expect(response.headers["set-cookie"][0]).toMatch(/Max-Age=\d+/);
    });

    it("should login with google for existing user", async () => {
        const response = await request(app).post("/api/auth/google").send({
            token: "mock-google-token"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"][0]).toContain("token=");
        expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
        expect(response.headers["set-cookie"][0]).toContain("Secure");
        expect(response.headers["set-cookie"][0]).toContain("SameSite=Strict");
        expect(response.headers["set-cookie"][0]).toMatch(/Max-Age=\d+/);
    });

    it("should not login with google for invalid token", async () => {
        const response = await request(app).post("/api/auth/google").send({
            token: "invalid-token"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Invalid Google token");
    });

    it("should handle error if google login fails", async () => {
        mockVerifyGoogleToken.mockRejectedValueOnce(new Error("Google login failed"));
        const response = await request(app).post("/api/auth/google").send({
            token: "mock-google-token"
        });
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Google login failed");
    });

    it("should not login a user using email and password if user is registered with Google", async () => {
        const response = await request(app).post("/api/auth/login").send({
            email: testGoogleEmail,
            password: "password"
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("User is registered with Google. Please sign in with Google.");
    });

});
