const qdrant = require("../config/qdrant");

const COLLECTION_NAME = "resume_chunks";
const VECTOR_SIZE = 768; // Google text-embedding-004 dimension

async function initQdrant() {
  try {
    const collections = await qdrant.getCollections();

    const exists = collections?.collections?.some(
      c => c.name === COLLECTION_NAME
    );

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine"
        }
      });

      console.log("✅ Qdrant collection created");

      // 🔥 Add payload indexes (VERY IMPORTANT)
      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "userId",
        field_schema: "keyword"
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "resumeId",
        field_schema: "keyword"
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: "type",
        field_schema: "keyword",
      });
  console.log("✅ Created payload index for 'type'");

      console.log("✅ Payload indexes created");
    } else {
      console.log("ℹ️ Qdrant collection already exists");
    }
  } catch (err) {
    console.error("❌ Qdrant init error:", err.message);
  }
}


module.exports = {
  initQdrant,
  COLLECTION_NAME
};