const request = require("supertest");
const app = require("../app");
const Department = require("../models/Department.model");
const Appointment = require("../models/Appointment.model");
const cloudinary = require("../config/cloudinary");

let testEmail1 = `test${Date.now()}@mail.com`;
let testEmail2 = `test${Date.now()+1}@mail.com`;
let testDepartment;
let departmentId;
let appointmentId;
let testUser1;
let testUser2;

describe("Appointment API", () => {
    beforeAll(async () => {
        testUser1 = await request(app).post("/api/auth/register").send({
            name: "Test User1",
            email: testEmail1,
            password: "password"
        });
        testUser2 = await request(app).post("/api/auth/register").send({
            name: "Test User2",
            email: testEmail2,
            password: "password"
        });
        await Department.create({
            name: "Test Department",
            image: "test.jpg"
        });
        testDepartment = await Department.findOne({ name: "Test Department" });
        departmentId = testDepartment._id;
    })

    it("should create an appointment without reports", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/appointments").set("Cookie", cookies)
            .field("departmentId", departmentId.toString())
            .field("date", new Date().toISOString())
            .field("phone", "1234567890")
            .field("comments", "Test Comments");
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
    })
    
    it("should create an appointment with reports", async () => {
        jest.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
            callback(null, { secure_url: "https://example.com/profile.jpg" });
        });
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).post("/api/appointments").set("Cookie", cookies)
            .field("departmentId", departmentId.toString())
            .field("date", new Date().toISOString())
            .field("phone", "1234567890")
            .field("comments", "Test Comments")
            .attach("reports",Buffer.from("default"),"default.jpg");
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
    })

    it("should handle error when cloudinary upload fails", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        jest.spyOn(cloudinary.uploader, "upload_stream").mockImplementation((options, callback) => {
            callback(new Error("Cloudinary error"), null);
        });
        const response = await request(app).post("/api/appointments").set("Cookie", cookies)
            .field("departmentId", departmentId.toString())
            .field("date", new Date().toISOString())
            .field("phone", "1234567890")
            .field("comments", "Test Comments")
            .attach("reports",Buffer.from("default"),"default.jpg");
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
    })

    it("should get all appointments", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/appointments").set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
    })

    it("should get all appointments by year", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const response = await request(app).get("/api/appointments?year=2026").set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("data");
    })

    it("should handle error while fetching appointments", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        jest.spyOn(Appointment, "find").mockReturnValueOnce({
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
        });
        const response = await request(app).get("/api/appointments").set("Cookie", cookies);
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
    })

    it("should be able to delete an appointment", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const appointment = await Appointment.findOne({ departmentId });
        appointmentId = appointment._id;
        const response = await request(app).delete(`/api/appointments/${appointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("message", "Appointment cancelled successfully");
    })

    it("should return 404 if appointment not found", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const invalidAppointmentId = "692e632289c3131f42b81111";
        const response = await request(app).delete(`/api/appointments/${invalidAppointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "Appointment not found");
    })

    it("should handle error while deleting an appointment", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        jest.spyOn(Appointment, "findById").mockRejectedValueOnce(new Error("Database error"));
        const response = await request(app).delete(`/api/appointments/${appointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message");
    })

    it("should return 403 if user is not authorized to delete the appointment", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail2,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const appointment = await Appointment.findOne({ departmentId });
        appointmentId = appointment._id;
        const response = await request(app).delete(`/api/appointments/${appointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("message");
    })

    it("should handle error while deleting reports from cloudinary", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        const appointment = await Appointment.findOne({ departmentId });
        appointmentId = appointment._id;
        jest.spyOn(cloudinary.uploader, "destroy").mockImplementation((publicId, callback) => {
            callback(new Error("Cloudinary error"), null);
        });
        const response = await request(app).delete(`/api/appointments/${appointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message","Cloudinary error");
    })

    it("should succesfully delete reports from cloudinary on cancelation of appointment", async () => {
        const loginResponse = await request(app).post("/api/auth/login").send({
            email: testEmail1,
            password: "password",
        });
        const cookies = loginResponse.headers["set-cookie"][0];
        await Appointment.create({
            userId: testUser1.body.id,
            departmentId,
            appointmentDate: new Date(),
            phone: "1234567890",
            comments: "Test Comments",
            reports: [
                {
                    url: "https://example.com/report.jpg",
                    public_id: "report",
                    format: "jpg",
                },
            ],
        });
        const appointment = await Appointment.findOne({ departmentId });
        appointmentId = appointment._id;
        jest.spyOn(cloudinary.uploader, "destroy").mockImplementation((publicId, callback) => {
            callback(null, {
                result: "ok",
            });
        });
        const response = await request(app).delete(`/api/appointments/${appointmentId}`).set("Cookie", cookies);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message");
    })
    
});