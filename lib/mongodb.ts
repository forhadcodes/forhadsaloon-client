import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri) throw new Error("MongoDB is not configured. Add MONGODB_URI to your .env file.")

const globalForMongo = globalThis as typeof globalThis & { mongoClient?: MongoClient }

export const mongoClient = globalForMongo.mongoClient ?? new MongoClient(uri)
globalForMongo.mongoClient = mongoClient

export const salonDb = mongoClient.db(process.env.MONGODB_DB_NAME ?? "forhadsaloondb")
