const { CreateTableCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { marshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
    region: "us-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const readTable = async() => {
    const command = new ScanCommand({
        TableName: "Users",
    });

    const response = await docClient.send(command);
    // console.log("Table data:", response.Items);
    return response.Items;
}

const addItem = async(newUser) => {
    const command = new PutCommand({
        TableName: "Users",
        Item: newUser,
    });

    const response = await docClient.send(command)
    console.log(response);
    return response;
}

module.exports = { addItem, readTable };