const request = require('supertest');
const app = require('../app');

jest.mock('../database', () => ({
    readUsers: jest.fn(),
    readUser: jest.fn(),
    validUsername: jest.fn(),
    addUser: jest.fn(),
    updateFollowing: jest.fn(),
    updateFollowers: jest.fn(),
}));
const { readUsers, readUser, validUsername, addUser, updateFollowing, updateFollowers } = require('../database');

jest.mock('../scripts/encrypt', () => ({
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
}));
const { hashPassword, comparePasswords } = require('../scripts/encrypt');
const { hash } = require('bcrypt');

describe("GET all /users", () => {
    beforeAll(() => {
        // mock results
        readUsers.mockResolvedValue([
            { id: 1, username: 'testUser' },
            { id: 2, username: 'testUser2' },
            { id: 3, username: 'testUser3' },
        ])
    })

    test("should return all users in db", async () => {
        const response = await request(app)
            .get("/users")
            .expect("Content-Type", /json/)
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
    });
});

describe("GET /users/:userId", () => {
    const testUser = {
        userId: 1,
        username: 'testUser',
        firstName: 'test',
        lastName: 'User',
        email: 'test@email.com'
    }

    beforeAll(() => {
        readUser.mockResolvedValue(testUser)
    });

    test("should return user data for valid userId", async() => {
        const userId = '12345';

        const response = await request(app)
            .get(`/users/${userId}`)
            .expect('Content-Type', /json/);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(testUser)
        expect(readUser).toHaveBeenCalledWith(userId);
    })

    test("case: non-valid userId --> return 404 and err message", async() => {
        readUser.mockResolvedValue(null);
        const userId = 'abc';

        const response = await request(app)
            .get(`/users/${userId}`)
            .expect('Content-Type', /json/);
        expect(response.status).toBe(404);
        expect(readUser).toHaveBeenCalledWith(userId);
        expect(response.body).toEqual({message: "User not found"})
    })
})

describe("POST /users/newUser", () => {
    addUser.mockResolvedValue(true);
    hashPassword.mockResolvedValue('hashedPass');

    const testUser = {
        fname: "Test",
        lname: "User",
        username: "testUser",
        email: "test@email.com",
        password: "password"
    };

    test("creating a new user and redirect", async() => {
        validUsername.mockResolvedValue(true);

        const response = await request(app)
            .post(`/users/newUser`)
            .expect('Content-Type', /text\/plain/)
            .send(testUser)
            .expect(302);

        expect(response.headers.location).toBe('https://main.d1ju3g0cqu0frk.amplifyapp.com/');
    })

    test("user tries creating a user with username that is already taken", async() => {
        validUsername.mockResolvedValue(false);

        const response = await request(app)
            .post(`/users/newUser`)
            .expect('Content-Type', /json/)
            .send(testUser)
            .expect(404);
        expect(response.body).toEqual({error: "Username is already taken"})
    })

    test("missing user data", async() => {
        validUsername.mockResolvedValue(true);
        const badUser = {
            fname: "test",
            lname: "user"
        }

        const response = await request(app)
            .post(`/users/newUser`)
            .expect('Content-Type', /text\/plain/)
            .send(badUser)
            .expect(302);
    })
})

describe("PUT /users/toggleFollowing", () => {
    const data = {
        userId: "123",
        targetId: "456"
    }

    test("case: userId is NOT following targetId --> ADD to following list", async() => {
        updateFollowing.mockResolvedValue(`Added ${data.targetId} to ${data.userId}'s following list`)

        const response = await request(app)
            .put('/users/toggleFollowing')
            .expect('Content-Type', /text\/html/)
            .send(data)
            .expect(200)
        expect(response.body).toEqual({})
    })

    test("case: userId IS following targetId --> REMOVE from following list", async() => {
        updateFollowing.mockResolvedValue(`Removed ${data.targetId} from ${data.userId}'s following list`)

        const response = await request(app)
            .put('/users/toggleFollowing')
            .expect('Content-Type', /text\/html/)
            .send(data)
            .expect(200)
        expect(response.body).toEqual({})
    })
})

describe("PUT /users/toggleFollowers", () => {
    const data = {
        userId: "123",
        targetId: "456"
    }

    test("case: userId is NOT a follower of targetId --> ADD targetId to follower list", async() => {
        updateFollowers.mockResolvedValue(`Added ${data.userId} to ${data.targetId}'s followers list`)

        const response = await request(app)
            .put('/users/toggleFollowers')
            .expect('Content-Type', /text\/html/)
            .send(data)
            .expect(200)
        expect(response.body).toEqual({})
    })

    test("case: userId IS a follower of targetId --> REMOVE targetId from follower list", async() => {
        updateFollowers.mockResolvedValue(`Removed ${data.userId} from ${data.targetId}'s followers list`)

        const response = await request(app)
            .put('/users/toggleFollowers')
            .expect('Content-Type', /text\/html/)
            .send(data)
            .expect(200)
        expect(response.body).toEqual({})
    })
})