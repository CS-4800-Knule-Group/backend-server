const request = require('supertest')
const app = require('../app')

jest.mock('../database', () => ({
    getUserPass: jest.fn(),
    getUserId: jest.fn(),
    addRtoken: jest.fn(),
    getRtoken: jest.fn(),
    deleteRtoken: jest.fn(),
}));

jest.mock('../scripts/encrypt', () => ({
    comparePasswords: jest.fn(),
}))

const { getUserPass, getUserId, addRtoken, getRtoken, deleteRtoken } = require('../database')
const { comparePasswords } = require('../scripts/encrypt')

describe("POST /auth/login", () => {
    const username = "testUser";
    const password = "testPassword";
    const userId = "12345";
    const storedPass = "hashedPassword";

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("should return access token for valid credentials", async () => {
        getUserPass.mockResolvedValue(storedPass);
        comparePasswords.mockResolvedValue(true);
        getUserId.mockResolvedValue(userId);
        addRtoken.mockResolvedValue();

        const response = await request(app)
            .post("/auth/login")
            .send({ username, password })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(getUserPass).toHaveBeenCalledWith(username);
        expect(comparePasswords).toHaveBeenCalledWith(password, storedPass);
        expect(getUserId).toHaveBeenCalledWith(username);
        expect(addRtoken).toHaveBeenCalled();
        expect(response.body).toHaveProperty("accessToken");
    });

    test("should return 400 for invalid credentials", async () => {
        getUserPass.mockResolvedValue(storedPass);
        comparePasswords.mockResolvedValue(false);

        const response = await request(app)
            .post("/auth/login")
            .send({ username, password })
            .expect(400);

        expect(comparePasswords).toHaveBeenCalledWith(password, storedPass);
    });
});

describe("DELETE /auth/logout", () => {
    const userId = "12345";

    test("should delete refresh token and return 204", async () => {
        deleteRtoken.mockResolvedValue();

        await request(app)
            .delete("/auth/logout")
            .send({ userId })
            .expect(204);

        expect(deleteRtoken).toHaveBeenCalledWith(userId);
    });

    test("should return 400 if logout fails", async () => {
        deleteRtoken.mockRejectedValue(new Error("Logout failed"));

        await request(app)
            .delete("/auth/logout")
            .send({ userId })
            .expect(400);

        expect(deleteRtoken).toHaveBeenCalledWith(userId);
    });
});

describe("POST /auth/token", () => {
    const refreshToken = "validRefreshToken";
    const user = { userId: "12345", username: "testUser" };

    test("should return new access token for valid refresh token", async () => {
        getRtoken.mockResolvedValue(refreshToken);
        jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
            callback(null, user);
        });

        const response = await request(app)
            .post("/auth/token")
            .send({ token: refreshToken })
            .expect("Content-Type", /json/)
            .expect(200);

        expect(response.body).toHaveProperty("accessToken");
    });

    test("should return 401 for missing refresh token", async () => {
        await request(app)
            .post("/auth/token")
            .send({})
            .expect(401);
    });

    test("should return 403 for invalid refresh token", async () => {
        jest.spyOn(require('jsonwebtoken'), 'verify').mockImplementation((token, secret, callback) => {
            callback(new Error("Invalid token"), null);
        });

        await request(app)
            .post("/auth/token")
            .send({ token: refreshToken })
            .expect(403);
    });
});