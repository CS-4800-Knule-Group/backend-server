const { CreateTableCommand, DynamoDBClient, QueryCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient, ScanCommand, DeleteCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { stat } = require('fs');

const client = new DynamoDBClient({
    region: "us-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);  
// use docClient , this is the higher level one and easier to work with
// need to change all functions using client --> docClient

const readUsers = async() => {
    const command = new ScanCommand({
        TableName: "Users",
    });

    const response = await docClient.send(command);
    // console.log("Table data:", response.Items);
    return response.Items;
}

const readUser = async(userId) => {
    const command = new GetItemCommand({
        TableName: "Users",
        Key: {
            userId: { S: userId }
        }
    });

    const response = await client.send(command)
    return response.Item;
}

const validUsername = async (username) => {
    const command = new QueryCommand({
        TableName: "Users",
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ':username': { S: username }
        },
        ProjectionExpression: "username"
    })

    try {
        const response = await client.send(command);
        return response.Items.length === 0; // If no items are returned, the username is unique
    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        throw error;
    }
};

const addUser = async(newUser) => {
    const command = new PutCommand({
        TableName: "Users",
        Item: newUser,
    });

    const response = await docClient.send(command)
    // console.log(response['$metadata'].httpStatusCode)
    const statusCode = response['$metadata'].httpStatusCode;
    if (statusCode == 200) {
        return true;
    } else {
        return false;
    }
}

const readPosts = async() => {
    const command = new ScanCommand({
        TableName: "Posts",
    });

    const response = await docClient.send(command);
    return response.Items;
}

const readPostsBy = async(userId) => {
    const command = new ScanCommand({
        TableName: "Posts",
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": { S: userId}
        }
    })

    const response = await client.send(command)
    return response.Items;
}

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

const delPost = async (userId, postId) => {
    const command = new DeleteCommand({
        TableName: "Posts",
        Key: {
            userId: userId,     // partition key
            postId: postId,     // sort key
        },
        ConditionExpression: "attribute_exists(userId) AND attribute_exists(postId)",   // only deletes if post attributes exist
        ReturnValues: "ALL_OLD"     // should return deleted post
    });

    try {
        const response = await docClient.send(command);
        console.log("Post deleted successfully.");
        return getStatusCode(response);
    } catch (error) {
        console.log("Error: ", error.name);
        return getStatusCode(error)
    }
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
    const commandGet = new QueryCommand({
        TableName: "Users",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues:{
            ":userId": {S: userId}
        }
    })

    try{
        const getResponse = await client.send(commandGet);
        const items = getResponse.Items;
        const followingList = items[0].following.L.map(attr => attr.S);

        const index = followingList.indexOf(targetId);

        const commandDelete = new UpdateCommand({
            TableName: "Users",
            Key: {
                userId: userId,
            },
            UpdateExpression: `REMOVE #following[${index}]`,
            ExpressionAttributeNames:{
                '#following' : 'following'
            },
            ReturnValues: 'UPDATED_NEW'
        });

        await docClient.send(commandDelete);

        
        console.log(`Removed ${targetId} from ${userId}'s following list`)
        return(`Removed ${targetId} from ${userId}'s following list`)
    } catch(err){
        if(err.name === 'ValidationException'){
            const command = new UpdateCommand({
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

            try{
                const response = await docClient.send(command);
                console.log(`Added ${targetId} to ${userId}'s following list`)
                return(`Added ${targetId} to ${userId}'s following list`)
            } catch(error){
                return("Fail ", error);
            }
        }else{
            return("Operation Failed.")
        }
    }
}

const updateFollowers = async (userId, targetId) =>{
    const commandGet = new QueryCommand({
        TableName: "Users",
        KeyConditionExpression: "userId = :targetId",
        ExpressionAttributeValues:{
            ":targetId": {S: targetId}
        }
    })

    try{
        const getResponse = await client.send(commandGet);
        const items = getResponse.Items;
        const followingList = items[0].followers.L.map(attr => attr.S);

        const index = followingList.indexOf(userId);

        const commandDelete = new UpdateCommand({
            TableName: "Users",
            Key: {
                userId: targetId,
            },
            UpdateExpression: `REMOVE #followers[${index}]`,
            ExpressionAttributeNames:{
                '#followers' : 'followers'
            },
            ReturnValues: 'UPDATED_NEW'
        });

        await docClient.send(commandDelete);
        console.log("Passed Delete Command")

        
        console.log(`Removed ${userId} from ${targetId}'s followers list`)
        return(`Removed ${userId} from ${targetId}'s followers list`)
    } catch(err){
        if(err.name === 'ValidationException'){
            const command = new UpdateCommand({
                TableName: "Users",
                Key: {
                    userId: targetId,
                },
                UpdateExpression: "SET #followers = list_append(#followers, :followers)",
                ExpressionAttributeNames:{
                    '#followers' : 'followers'
                },
                ExpressionAttributeValues: {
                    ':followers' : [userId]
                },
                ReturnValues: 'UPDATED_NEW'
            });

            try{
                const response = await docClient.send(command);
                console.log(`Added ${userId} to ${targetId}'s followers list`)
                return(`Added ${userId} to ${targetId}'s followers list`)
            } catch(error){
                return("Fail ", error);
            }
        }else{
            return("Operation Failed.")
        }
    }
}

const updateUser = async(userId, bio, name, pfp = "DNE", banner = "DNE") => {
    let updateExpression = "SET #bio = :newBio, #fullName = :newName, #pfp = :newPfp, #pfBanner = :newBanner"
    let ExpressionAttributeNames = {
        "#bio" : "bio",
        "#fullName" : "fullName",
        "#pfp" : "pfp",
        "#pfBanner" : "pfBanner"
    }
    let ExpressionAttributeValues = {
        ":newBio" : bio,
        ":newName" : name,
        ":newPfp" : pfp,
        ":newBanner" : banner
    }
    

    if(pfp == "DNE" & banner == "DNE"){
        updateExpression = "SET #bio = :newBio, #fullName = :newName"
        ExpressionAttributeNames = {
            "#bio" : "bio",
            "#fullName" : "fullName",
        }
        ExpressionAttributeValues = {
            ":newBio" : bio,
            ":newName" : name,
        }
    }else if(pfp == "DNE"){
        updateExpression = "SET #bio = :newBio, #fullName = :newName, #pfBanner = :newBanner"    
        ExpressionAttributeNames = {
            "#bio" : "bio",
            "#fullName" : "fullName",
            "#pfBanner" : "pfBanner"
        }
        ExpressionAttributeValues = {
            ":newBio" : bio,
            ":newName" : name,
            ":newBanner" : banner
        }
    } else if (banner == "DNE"){
        updateExpression = "SET #bio = :newBio, #fullName = :newName, #pfp = :newPfp"
        ExpressionAttributeNames = {
            "#bio" : "bio",
            "#fullName" : "fullName",
            "#pfp" : "pfp",
        }
        ExpressionAttributeValues = {
            ":newBio" : bio,
            ":newName" : name,
            ":newPfp" : pfp,
        }
    }


    const command = new UpdateCommand({
        TableName: "Users",
        Key : {
            userId : userId,
        },
        UpdateExpression : updateExpression,
        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues
    })

    try{
        await docClient.send(command);
        console.log("Updated " + userId)
    } catch(err){
        console.log("Failed to update " + userId + err);
    }
}

// HELPER FUNCTION TO GET HTTP STATUS CODE FROM RESPONSE
// ONLY USE IF YOU KNOW WHAT RESPONSE LOOKS LIKE, otherwise it may break something
function getStatusCode(response) {
    return response['$metadata'].httpStatusCode
}

module.exports = { addUser, readUsers, createPost, readPosts, readLikes, 
    readComments, getUserPass, getUserId, addRtoken, getRtoken, deleteRtoken,
    getUserPosts, saveMessage, getMessageHistory, updateFollowing, updateFollowers,
    updateUser, validUsername, delPost
 };