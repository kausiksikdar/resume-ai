const {QdrantClient} = require('@qdrant/js-client-rest');

const client = new QdrantClient({
    url: 'https://83341f75-ce67-4015-8553-720e28ebc315.eu-central-1-0.aws.cloud.qdrant.io',
    apiKey: process.env.QDRANT_API_KEY,
});

module.exports = client;