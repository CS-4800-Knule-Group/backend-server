const request = require('supertest');
const app = require('../app');

jest.mock('../database', () => ({
    readPosts: jest.fn(),
    createPost: jest.fn(),
    getUserPosts: jest.fn(),
}));
const { readPosts, createPost, getUserPosts } = require('../database');

// jest.mock('../scripts/middleware', () => ({
//     authenticateToken: jest.fn((req, res, next) => next()),
//     // multipartDouble: jest.fn((req, res, next) => next()), 
// }));
// const { authenticateToken, multipartDouble } = require('../scripts/middleware');

describe("GET /posts", () => {
    beforeAll(() => {
        readPosts.mockResolvedValue([
            { id: 1, content: "post 1" },
            { id: 2, content: "post 2" },
            { id: 3, content: "post 3" },
            { id: 4, content: "post 4" },
            { id: 5, content: "post 5" },
        ])
    })

    test("should return all posts in db", async() => {
        const response = await request(app)
            .get("/posts")
            .expect("Content-Type", /json/)
            .expect(200)
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(5);
    })
})

describe("POST /posts/:userId", () => {
    createPost.mockResolvedValue({httpStatusCode: 200});

    const postData = {
        id: 1,
        content: "This is a test post"
    };

    test("should create a new post and redirect", async() =>{
        const userId = '123'

        const response = await request(app)
            .post(`/posts/${userId}`)
            .expect("Content-Type", /text\/plain/)
            .send(postData)
            .expect(302);
        expect(response.headers.location).toBe('https://main.d1ju3g0cqu0frk.amplifyapp.com/feed');
    })

    test("blank post content --> should return error", async() => {
        const userId = '123'
        const badPost = {
            id: 1,
            content: ""
        }

        const response = request(app)
            .post(`/posts/${userId}`)
            .expect("Content-Type", /text\/plain/)
            .send(badPost)
            .expect(400);
    })
})

describe("GET /posts/:userId", () => {
    const userPosts = [
        { userId: '123', postId: 1, content: "test post 1" },
        { userId: '123', postId: 2, content: "test post 2" },
        { userId: '123', postId: 3, content: "test post 3" },
    ]
    getUserPosts.mockResolvedValue(userPosts)

    test("should return all posts by a user", async() => {
        const userId = '123'

        const response = await request(app)
            .get(`/posts/${userId}`)
            .expect("Content-Type", /json/)
            .expect(200);
        expect(response.body).toEqual(userPosts);
        expect(getUserPosts).toHaveBeenCalledWith(userId);
    })

    test("should return 400 or error if userId is invalid", async() => {
        const userId = 'abc'

        const response = await request(app)
            .get(`/posts/${userId}`)
            .expect("Content-Type", /json/)
            .expect(400);
        expect(response.body).toEqual({error: "Username is already taken"});
    })
})