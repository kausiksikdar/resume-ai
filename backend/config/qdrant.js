const {QdrantClient} = require('@qdrant/js-client-rest');

const client = new QdrantClient({
    url: 'https://2feda190-fd36-4713-a463-5022d0e914ee.us-east-1-1.aws.cloud.qdrant.io',
    apiKey: process.env.QDRANT_API_KEY,
});

module.exports = client;