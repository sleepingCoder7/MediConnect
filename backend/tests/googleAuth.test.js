const verifyGoogleToken = require("../utils/googleAuth");
const { OAuth2Client } = require("google-auth-library");

jest.mock("google-auth-library");

describe("Google Auth", () => {
    let mockVerifyIdToken;

    beforeEach(() => {
        jest.clearAllMocks();
        mockVerifyIdToken = jest.fn();
        OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
        process.env.GOOGLE_CLIENT_ID = "test-client-id";
        process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
    });

    it("should return payload for valid google token", async () => {
        const mockPayload = {
            email: "test@mail.com",
            name: "Test User",
            picture: "https://example.com/test.jpg"
        };
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => mockPayload
        });

        const response = await verifyGoogleToken("valid-token");

        expect(mockVerifyIdToken).toHaveBeenCalledWith({
            idToken: "valid-token",
            audience: process.env.GOOGLE_CLIENT_ID
        });
        expect(response).toEqual(mockPayload);
    });

    it("should return null for invalid google token", async () => {
        mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));

        const response = await verifyGoogleToken("invalid-token");

        expect(response).toBeNull();
    });

});
