const { CreateTableCommand, DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: "us-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);



const readComments = async() => {
    const command = new ScanCommand({
        TableName: "Comments",
    });

    const response = await docClient.send(command);
    return response.Items;
}

const createComment = async(newComment) => {
    const command = new PutCommand({
        TableName: "Comments",
        Item: newComment,
    })

    const response = await docClient.send(command);
    return response;
}



module.exports = { addUser, readUsers, createPost, readPosts, readLikes, readComments, getUserPass };