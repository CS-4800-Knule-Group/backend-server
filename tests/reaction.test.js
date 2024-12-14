const request = require('supertest');
const express = require('express');
const reactionRoutes = require('../routes/reaction'); // Adjust path as needed
const {
    readLikes,
    createLike,
    addLikeToPost,
    deleteLikeFromPost,
    deleteLike,
    getPost,
} = require('../database');

// Mock database functions
jest.mock('../database', () => ({
    readLikes: jest.fn(),
    createLike: jest.fn(),
    addLikeToPost: jest.fn(),
    deleteLikeFromPost: jest.fn(),
    deleteLike: jest.fn(),
    getPost: jest.fn(),
}));

const app = express();
app.use(express.json()); // Middleware for JSON parsing
app.use('/reaction', reactionRoutes);

describe('Reaction Routes', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('GET /reaction/', () => {
        it('should fetch all likes', async () => {
            const mockLikes = [{ targetId: 'post1', userId: 'user1' }];
            readLikes.mockResolvedValue(mockLikes);

            const response = await request(app).get('/reaction/').expect(200);

            expect(response.body).toEqual(mockLikes);
            expect(readLikes).toHaveBeenCalledTimes(1);
        });
    });

    describe('POST /reaction/:postId', () => {
        it('should create a new like and add it to the post', async () => {
            const postId = 'post1';
            const userId = 'user1';
            const mockPost = { userId: 'postOwner' };
            const mockNewLike = { targetId: postId, userId };

            createLike.mockResolvedValue(mockNewLike);
            getPost.mockResolvedValue(mockPost);
            addLikeToPost.mockResolvedValue(200);

            const response = await request(app)
                .post(`/reaction/${postId}`)
                .send({ userId })
                .expect(200);

            expect(response.body).toEqual(mockNewLike);
            expect(createLike).toHaveBeenCalledWith(mockNewLike);
            expect(getPost).toHaveBeenCalledWith(postId);
            expect(addLikeToPost).toHaveBeenCalledWith(mockPost.userId, postId, userId);
        });

        it('should return an error if adding like fails', async () => {
            const postId = 'post1';
            const userId = 'user1';
            const mockPost = { userId: 'postOwner' };

            createLike.mockResolvedValue({});
            getPost.mockResolvedValue(mockPost);
            addLikeToPost.mockResolvedValue(500);

            const response = await request(app)
                .post(`/reaction/${postId}`)
                .send({ userId })
                .expect(500);

            expect(addLikeToPost).toHaveBeenCalledWith(mockPost.userId, postId, userId);
        });
    });

    describe('DELETE /reaction/:postId/:likerId', () => {
        it('should delete a like from the post', async () => {
            const postId = 'post1';
            const likerId = 'user1';
            const mockPost = { userId: 'postOwner' };

            deleteLike.mockResolvedValue(204);
            getPost.mockResolvedValue(mockPost);
            deleteLikeFromPost.mockResolvedValue(204);

            const response = await request(app)
                .delete(`/reaction/${postId}/${likerId}`)
                .expect(204);

            expect(deleteLike).toHaveBeenCalledWith(postId, likerId);
            expect(getPost).toHaveBeenCalledWith(postId);
            expect(deleteLikeFromPost).toHaveBeenCalledWith(mockPost.userId, postId, likerId);
        });

        it('should return an error if deletion fails', async () => {
            const postId = 'post1';
            const likerId = 'user1';

            deleteLike.mockResolvedValue(400);

            const response = await request(app)
                .delete(`/reaction/${postId}/${likerId}`)
                .expect(400);

            expect(deleteLike).toHaveBeenCalledWith(postId, likerId);
            expect(deleteLikeFromPost).not.toHaveBeenCalled(); // Should not be called if the main delete fails
        });
    });
});
