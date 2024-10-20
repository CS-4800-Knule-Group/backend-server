const { CreateTableCommand, DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient, ScanCommand, DeleteCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
    region: "us-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const readUsers = async() => {
    const command = new ScanCommand({
        TableName: "Users",
    });

    const response = await docClient.send(command);
    // console.log("Table data:", response.Items);
    return response.Items;
}

const addUser = async(newUser) => {
    const command = new PutCommand({
        TableName: "Users",
        Item: newUser,
    });

    const response = await docClient.send(command)
    return response;
}

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

const readLikes = async() => {
    const command = new ScanCommand({
        TableName: "Likes",
    });

    const response = await docClient.send(command);
    return response.Items;
}

const createLike = async(newLike) => {
    const command = new PutCommand({
        TableName: "Likes",
        Item: newLike,
    })

    const response = await docClient.send(command);
    return response;
}

const getUserPass = async(username) => {
    try {
        const command = new QueryCommand({
            TableName: "Users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ':username': { S: username }
            },
            ProjectionExpression: "password"
        })
    
        const response = await client.send(command)

        if (response.Items.length > 0) {
            return response.Items[0].password.S; // Return the password from the result
        } else {
            return "User not found.";
        }
    } catch (error) {
        console.error("Error querying user:", error);
        throw new Error("Failed to query user password")
    }
}

const getUserId = async (username) => {
    try {
        const command = new QueryCommand({
            TableName: "Users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ':username': { S: username }
            },
            ProjectionExpression: "userId"
        })
    
        const response = await client.send(command)

        if (response.Items.length > 0) {
            return response.Items[0].userId.S; // Return the password from the result
        } else {
            return "User not found.";
        }
    } catch (error) {
        console.error("Error querying user:", error);
        throw new Error("Failed to query user password")
    }
}

const addRtoken = async (rToken) => {
    const command = new PutCommand({
        TableName: "RefreshTokens",
        Item: rToken
    })

    const response = await docClient.send(command);
    return response;
}

const getRtoken = async (userId) => {
    const command = new QueryCommand({
        TableName: "RefreshTokens",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": { S: userId }
        },
        ProjectionExpression: "rToken"
    })

    const response = await client.send(command)
    if (response.Items.length > 0) {
        return response.Items[0].rToken.S
    } else {
        throw new Error("User does not have a valid refresh token")
    }
}



const deleteRtoken = async (userId) => {
    try {
        const command = new DeleteCommand({
            TableName: "RefreshTokens",
            Key: {
                "userId": userId
            }
        })
        const response = await client.send(command)
    } catch (err) {
        console.log(err)
        throw new Error("Error deleting the record", err)
    }
}

const getUserPosts = async (userId) => {
    const command = new QueryCommand({
        TableName: "Posts",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": { S: userId }
        },
        ProjectionExpression: "postId"
    })

    const response = await client.send(command)
    return response.Items
}

const saveMessage = async (message) => {
    const command = new PutCommand({
        TableName: "Messages",
        Item: message
    })

    const response = await docClient.send(command)
    return response
}

const getMessageHistory = async (conversationId) => {
    const command = new QueryCommand({
        TableName: "Messages",
        KeyConditionExpression: "conversationId = :conversationId",
        ExpressionAttributeValues: {
            ":conversationId": { S: conversationId }
        },
        ScanIndexForward: true
    })

    const response = await client.send(command)
    if (response.Items.length > 0) {
        return response.Items
    } else {
        console.error('Error fetching message history', err);
        return []
    }
}

const updateFollowing = async (userId, targetId) =>{
    
    const commandAdd = new UpdateCommand({
        TableName: "Users",
        Key: {
            userId: userId,
        },
        UpdateExpression: "SET #following = list_append(#following, :following)",
        ExpressionAttributeNames:{
            '#following' : 'following'
        },
        ExpressionAttributeValues: {
            ':following' : [targetId]
        },
        ReturnValues: 'UPDATED_NEW'
    });

    const commandGetList = new QueryCommand({
        TableName: "Users",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues:{
            ':userId': {S: userId}
        }
    })

    

    try{
        const getResponse = await client.send(commandGetList);
        const item = getResponse.Items;

        if(!item[0].userId){
            console.log("There is no following list or Item")
            return;
        }

        const followingList = item[0].following.L.map(attr => attr.S);
        console.log(followingList);

        const index = followingList.indexOf(targetId);
        if(index !== -1){
            followingList.splice(index, 1);
            console.log(`Removed ${targetId} from following list.`);
        } else{
            followingList.push(targetId);
            console.log(followingList);
            console.log(`Added ${targetId} to following list.`);
        }

        const commandUpdate = new UpdateCommand({
            TableName: "Users",
            Key: {
                userId: userId,
            },
            UpdateExpression: 'SET following = :newList',
            ExpressionAttributeValues: {
                ':newList' : {L: followingList.map(id => ({S: id}))},
            }
        })

        await docClient.send(commandUpdate);
        return("Complete!")
    } catch(err){
        if (err )
        return("Fail ", err);
    }
}

module.exports = { addUser, readUsers, createPost, readPosts, readLikes, 
    readComments, getUserPass, getUserId, addRtoken, getRtoken, deleteRtoken,
    getUserPosts, saveMessage, getMessageHistory, updateFollowing
 };