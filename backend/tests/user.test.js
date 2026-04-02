const request = require("supertest");
const app = require("../app");
const User = require("../models/User.model");
const cloudinary = require("../config/cloudinary");

let testEmail = `test${Date.now()}@mail.com`;
let origin = process.env.FRONTEND_URL;

describe("User Routes", () => {
    it("should update user profile", async () => {
        //Register user
        const registerResponse = await request(app).post("/api/auth/register").send({
            name: "John Doe",
            email: testEmail,
            password: "password"
        });

        //Login user
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).put("/api/user/update").set("Cookie", cookies).set("Origin", origin).send({
            firstName: "John",
            lastName: "Doe",
            gender: "Male",
            dateOfBirth: "2000-01-01",
            email: testEmail,
            phone: "1234567890",
            line1: "123 Main St",
            line2: "123 Main St",
            city: "New York",
            state: "New York",
            zipcode: "123456"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("profile");
        expect(response.body.user).toHaveProperty("address");
        expect(response.body.user).toHaveProperty("profilePic");
        expect(response.body.user.profile).toHaveProperty("firstName");
        expect(response.body.user.profile).toHaveProperty("lastName");
        expect(response.body.user.profile).toHaveProperty("gender");
        expect(response.body.user.profile).toHaveProperty("dateOfBirth");
        expect(response.body.user.profile).toHaveProperty("phone");
        expect(response.body.user.address).toHaveProperty("line1");
        expect(response.body.user.address).toHaveProperty("line2");
        expect(response.body.user.address).toHaveProperty("city");
        expect(response.body.user.address).toHaveProperty("state");
        expect(response.body.user.address).toHaveProperty("zipcode");
    });

    it("should return 404 if user is not found", async () => {
        jest.spyOn(User, "findById").mockResolvedValueOnce(null);
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).put("/api/user/update").set("Cookie", cookies).set("Origin", origin).send({});

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("User not found");
    })

    it("should handle update error", async () => {
        jest.spyOn(User, "findById").mockRejectedValueOnce(new Error("Database error"));
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).put("/api/user/update").set("Cookie", cookies).set("Origin", origin).send({});

        expect(response.statusCode).toBe(500);    
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Database error");
    })

    it("should upload profile picture", async () => {
        jest.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
            callback(null, { secure_url: "https://example.com/profile.jpg" });
        });
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/user/upload-profile-pic").set("Cookie", cookies).set("Origin", origin).attach("profilePic",Buffer.from("./default.jpg"), "default.jpg");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("user");
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Profile picture uploaded successfully");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("profile");
        expect(response.body.user).toHaveProperty("address");
        expect(response.body.user).toHaveProperty("profilePic");
    })

    it("should fail if no file upload", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/user/upload-profile-pic").set("Cookie", cookies).set("Origin", origin);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("No file uploaded");
    })

    it("should fail if file upload fails", async () => {
        jest.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
            callback(new Error("File upload failed"), null);
        });
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: "password"
        });

        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/user/upload-profile-pic").set("Cookie", cookies).set("Origin", origin).attach("profilePic",Buffer.from("./default.jpg"), "default.jpg");
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("File upload failed");
    })

});