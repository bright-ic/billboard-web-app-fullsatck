import {MongoClient, Db, ObjectId} from "mongodb";

// const dbClient = mongo.MongoClient;
// const ObjectId = mongo.ObjectId;
let db: any, client: any;

export const mongo_id = ObjectId;

export const getDB = () => {
    return db;
}

export const getClient = () => {
    return client;
}

export const connect = async (dbName:string = '', pool_size: number=100) => {

    try {
        client = new MongoClient(process.env.DB_URL || '');
        await client.connect();
        if(dbName) {
            db = client.db(dbName);
            console.log(`Success:: Connected to ${dbName} database`);
        }
        return db
    } catch(e: any) {
        console.log("Error in DB connection: ", e.message, e)
    }
}

export const close_connection = async () => {
    if (client) return client.close();
}

export const switchDB = (dbName: string) => {
    db = client.db(dbName);
    if (db.serverConfig.isConnected()) {
        console.log(`SWITCHDB:: now using ${dbName} database`);
    }
}

export const getConnectedDBName = () => {
    let connected_database_name = '';
    try {
        connected_database_name = db.databaseName;
    } catch(e) {}
    return connected_database_name;
}



export default {
    getDB,
    getClient,
    connect,
    close_connection,
    switchDB,
    getConnectedDBName,
    id: mongo_id
};