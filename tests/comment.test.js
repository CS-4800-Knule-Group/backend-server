const request = require('supertest');
const express = require('express');
const commentRoutes = require('../routes/comments.js'); // Adjust the path to your routes file
const { 
    readComments, 
    getComments, 
    createComment, 
    getPost, 
    addToPost, 
    deleteComment, 
    deleteFromPost 
} = require('../database');

// Mocking database and middleware functions
jest.mock('../database', () => ({
    readComments: jest.fn(),
    getComments: jest.fn(),
    createComment: jest.fn(),
    getPost: jest.fn(),
    addToPost: jest.fn(),
    deleteComment: jest.fn(),
    deleteFromPost: jest.fn(),
}));

// Setting up the app with middleware
const app = express();
app.use(express.json());
app.use('/comments', commentRoutes);

describe('Comment Routes', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Reset mocks after each test
    });

    describe('GET /comments/', () => {
        it('should fetch all comments', async () => {
            const mockComments = [
                { commentId: 'comment1', postId: 'post1', userId: 'user1', content: 'Hello' },
                { commentId: 'comment2', postId: 'post2', userId: 'user2', content: 'Hi there' },
            ];
            readComments.mockResolvedValue(mockComments);

            const response = await request(app).get('/comments/').expect(200);

            expect(response.body).toEqual(mockComments);
            expect(readComments).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /comments/post/:postId', () => {
        it('should fetch comments for a specific post', async () => {
            const postId = 'post1';
            const mockComments = [
                { commentId: 'comment1', postId, userId: 'user1', content: 'Nice post!' },
            ];
            getComments.mockResolvedValue(mockComments);

            const response = await request(app)
                .get(`/comments/post/${postId}`)
                .expect(200);

            expect(response.body).toEqual(mockComments);
            expect(getComments).toHaveBeenCalledWith(postId);
        });
    });

    describe('POST /comments/newComment', () => {
        it('should create a new comment and associate it with the post', async () => {
            const postId = 'post1';
            const userId = 'user1';
            const content = 'This is a comment';
            const mockPost = { userId: 'postOwner' };
            const mockNewComment = {
                postId,
                commentId: 'newUniqueId',
                userId,
                content,
                createdAt: new Date().toISOString(),
            };

            createComment.mockResolvedValue(mockNewComment);
            getPost.mockResolvedValue(mockPost);
            addToPost.mockResolvedValue(200);

            const response = await request(app)
                .post('/comments/newComment')
                .send({ postId, userId, content })
                .expect(200);

            expect(response.body).toEqual(mockNewComment);
            expect(createComment).toHaveBeenCalledWith(expect.objectContaining({
                postId,
                userId,
                content,
            }));
            expect(getPost).toHaveBeenCalledWith(postId);
        });

        it('should return an error if comment creation fails', async () => {
            const postId = 'post1';
            const userId = 'user1';
            const content = 'This is a comment';

            createComment.mockResolvedValue(null); // Simulate failure
            addToPost.mockResolvedValue(500);

            const response = await request(app)
                .post('/comments/newComment')
                .send({ postId, userId, content })
                .expect(500);

            expect(addToPost).toHaveBeenCalled();
            expect(response.body).toEqual(null);
        });
    });

    describe('DELETE /comments/:postId/:commentId', () => {
        it('should delete a comment and remove it from the post', async () => {
            const postId = 'post1';
            const commentId = 'comment1';
            const mockPost = { userId: 'postOwner' };

            deleteComment.mockResolvedValue(204);
            getPost.mockResolvedValue(mockPost);
            deleteFromPost.mockResolvedValue(204);

            const response = await request(app)
                .delete(`/comments/${postId}/${commentId}`)
                .expect(204);

            expect(deleteComment).toHaveBeenCalledWith(postId, commentId);
            expect(getPost).toHaveBeenCalledWith(postId);
            expect(deleteFromPost).toHaveBeenCalledWith(mockPost.userId, postId, commentId);
        });

        it('should return an error if deletion fails', async () => {
            const postId = 'post1';
            const commentId = 'comment1';

            deleteComment.mockResolvedValue(400);

            const response = await request(app)
                .delete(`/comments/${postId}/${commentId}`)
                .expect(400);

            expect(deleteComment).toHaveBeenCalledWith(postId, commentId);
            expect(deleteFromPost).not.toHaveBeenCalled(); // Should not call if the main deletion fails
        });
    });
});
