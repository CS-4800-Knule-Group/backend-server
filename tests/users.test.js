// import dynamo testing client
const db = require('./dynamoTest')
// import db functions pertaining to user
const { addUser, readUser } = require('../database')

const mockUser = {
    userId: "123456",
    fullName: "Test User",
}

// test all user dynamo functions
describe("readUser", () => {
    test('should return account: pass_is_pass2', async () => {
        await db.put({
            TableName: "Users",
            Item: mockUser
        })

        const res = await readUser("123456")
        expect(res).toEqual(mockUser)
    })
})