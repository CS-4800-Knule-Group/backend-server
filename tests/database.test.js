const { DynamoDBDocumentClient, ScanCommand, GetItemCommand, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { readUsers, readUser, validUsername, addUser } = require('../database');

jest.mock('@aws-sdk/lib-dynamodb', () => {
    const originalModule = jest.requireActual('@aws-sdk/lib-dynamodb');
    return {
        ...originalModule,
        DynamoDBDocumentClient: {
            from: jest.fn(() => ({
                send: jest.fn(),
            })),
        },
    };
});

describe("Database Functions", () => {
    const mockSend = jest.fn();

    beforeAll(() => {
        DynamoDBDocumentClient.from.mockReturnValue({ send: mockSend });
    });

    afterEach(() => {
        mockSend.mockReset();
    });

    it("should return all users for readUsers", async () => {
        const mockUsers = [
            { userId: "1", name: "John Doe" },
            { userId: "2", name: "Jane Smith" },
        ];
        // Mock response for ScanCommand
        mockSend.mockImplementationOnce((command) => {
            if (command instanceof ScanCommand) {
                return Promise.resolve({ Items: mockUsers });
            }
            return Promise.reject(new Error("Unexpected command"));
        });

        const result = await readUsers();
        expect(result).toEqual(mockUsers);
        expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    });

    it("should return a single user for readUser", async () => {
        const mockUser = { userId: "1", name: "John Doe" };
        // Mock response for GetItemCommand
        mockSend.mockImplementationOnce((command) => {
            if (command instanceof GetItemCommand) {
                return Promise.resolve({ Item: mockUser });
            }
            return Promise.reject(new Error("Unexpected command"));
        });

        const result = await readUser("1");
        expect(result).toEqual(mockUser);
        expect(mockSend).toHaveBeenCalledWith(expect.any(GetItemCommand));
    });

    it("should validate username uniqueness in validUsername", async () => {
        // Mock response for QueryCommand (no matching usernames)
        mockSend.mockImplementationOnce((command) => {
            if (command instanceof QueryCommand) {
                return Promise.resolve({ Items: [] });
            }
            return Promise.reject(new Error("Unexpected command"));
        });

        const isValid = await validUsername("uniqueUsername");
        expect(isValid).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it("should add a new user for addUser", async () => {
        // Mock response for PutCommand
        mockSend.mockImplementationOnce((command) => {
            if (command instanceof PutCommand) {
                return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
            }
            return Promise.reject(new Error("Unexpected command"));
        });

        const result = await addUser({ userId: "3", name: "New User" });
        expect(result).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });
});
