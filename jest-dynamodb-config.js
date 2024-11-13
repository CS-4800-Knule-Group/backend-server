module.exports = {
    tables: [
        {
            TableName: 'Users',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            AttributeDefinitions: [
                {AttributeName: 'userId', AttributeType: 'S'},
                {AttributeName: 'bio', AttributeType: 'S'},
                {AttributeName: 'createdAt', AttributeType: 'S'},
                {AttributeName: 'email', AttributeType: 'S'},
                {AttributeName: 'firstName', AttributeType: 'S'},
                {AttributeName: 'followers', AttributeType: 'L'},   // may need to define contents of L
                {AttributeName: 'following', AttributeType: 'L'},
                {AttributeName: 'friends', AttributeType: 'L'},
                {AttributeName: 'fullName', AttributeType: 'S'},
                {AttributeName: 'lastName', AttributeType: 'S'},
                {AttributeName: 'password', AttributeType: 'S'},
                {AttributeName: 'pfBanner', AttributeType: 'S'},
                {AttributeName: 'pfp', AttributeType: 'S'},
                {AttributeName: 'posts', AttributeType: 'L'},
                {AttributeName: 'username', AttributeType: 'S'},
            ],
            ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'username-index',
                    KeySchema: [{AttributeName: 'username', KeyType: 'HASH'}],
                    Projection: {ProjectionType: 'ALL'},
                    ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}
                }
            ]
        },
    ],
    port: 8000,
}