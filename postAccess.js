const { CreateTableCommand, DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: "us-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);



const readPosts = async() => {
    const command = new ScanCommand({
        TableName: "Posts",
    });

    const response = await docClient.send(command);
    return response.Items;
}

// const readPostsBy = async(userId) => {
//     const command = new ScanCommand({
//         TableName: "Posts",

//     })
// }

const createPost = async(newPost) => {
    const command = new PutCommand({
        TableName: "Posts",
        Item: newPost,
    });

    const response = await docClient.send(command)
    return response;
}



module.exports = { addUser, readUsers, createPost, readPosts, readLikes, readComments, getUserPass };