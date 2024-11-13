const { DocumentClient } = require('aws-sdk/clients/dynamodb')

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...DocumentClient(isTest && {
        endpoint: 'localhost:8000',
        sslEnabled: false,
        region: 'local-env',
    }),
};

const db = new DocumentClient(config);

module.exports = db;