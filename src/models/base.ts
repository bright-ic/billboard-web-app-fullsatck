import db_settings from "./db-connection";
import * as _ from "lodash";
// const Redis = require('ioredis');
// const redis = new Redis(process.env.REDIS_URL);
import { DATABASE } from "../lib/contants";
import errorMessages from "../lib/error-messages";
import { ObjectId } from "mongodb";


export type objectType = { 
	[key: string]: any 
};
/**
 * Common MongoDB methods used for CRUD operations
 * Class MongoDB
 */
class BaseModel {
	static default_database = "";
	static is_db_connection_established = false;
	static last_connected_db = "";

	/**
	 * handler for database connection
	 * @var
	 */
	db = null;
	/**
	 * handler for database connection
	 * @var
	 */
	writeDb = null;
	/**
	 * if we should enable caching
	 * @var
	 */
	is_cached_model = false;
	/**
	 * cache time out if caching is enabled
	 * @var
	 */
	cache_timeout = 86400;

	/**
	 * collection name
	 * @var
	 */
	collection_name: string = "";
	connection = null;

	db_name = "";

	constructor(collection_name: string, db: string = DATABASE) {
		if (BaseModel.is_db_connection_established === true) {
			if (!_.isEmpty(db)) {
				this.db_name = db;
			} else if (!db && !_.isUndefined(DATABASE)) {
				this.db_name = DATABASE;
			}
			if (!_.isEmpty(collection_name) && _.isString(collection_name)) {
				this.collection_name = collection_name;
			}
			const connected_db_name = db_settings.getConnectedDBName();
			const last_connected_db = !_.isEmpty(connected_db_name)
				? connected_db_name
				: BaseModel.last_connected_db;
			if (!_.isEmpty(this.db_name) && this.db_name !== last_connected_db) {
				this.getDB();
			}

			return this;
		}
		(async () => {
			try {
				if (!db && !_.isUndefined(DATABASE)) {
					db = DATABASE;
				}
				await this._connect(collection_name, db);
				return this;
			} catch (e) {}
		})();
		return this;
	}

	/**
	 * connect to database or collection, throw exception if connection fails
	 * access MongoDB object, MongoCollection object for singleton connection
	 * if string is supplied, assumes collection name and establishes new connection
	 * @param {string|MongoDB|MongoCollection} initialize collection name
	 * @param {string} db    specify the database connection
	 * @return {true | *}         throw exception if it fails or true
	 * @throws Exception
	 */
	async _connect(initialize: string, db: string = "") {
		if (
			!BaseModel.is_db_connection_established ||
			(!_.isEmpty(db) && db !== this.db_name)
		) {
			if (_.isEmpty(db) && !_.isUndefined(DATABASE)) {
				db = DATABASE;
			}

			if (_.isString(db)) {
				this.db_name = BaseModel.last_connected_db = db;
			}
			if (_.isString(initialize)) {
				this.collection_name = initialize;
			}
			const dbConnected = await db_settings.connect(db);
			if (dbConnected) {
				BaseModel.is_db_connection_established = true;
				return true;
			} else {
				throw new Error("Unable to establish db connection");
			}
		}
	}

	getDB() {
		const connected_db_name = db_settings.getConnectedDBName();
		const last_connected_db = !_.isEmpty(connected_db_name)
			? connected_db_name
			: BaseModel.last_connected_db;
		if (!_.isEmpty(this.db_name) && last_connected_db !== this.db_name) {
			BaseModel.last_connected_db = this.db_name;
			db_settings.switchDB(this.db_name);
		}
		let db = db_settings.getDB();
		return db;
	}

	getCollection() {
		return this.getDB().collection(this.collection_name);
	}

	static isMongoId(id: string | ObjectId) {
		return db_settings.id.isValid(id);
	}

	isValidMongoId(id: string | ObjectId) {
		return db_settings.id.isValid(id);
	}

	/**
	 * Get distinct columns from db
	 * @param field
	 * @param query
	 * @return {Promise<*>}
	 */
	async getDistinct(field: string[], query = {}) {
		try {
			return await this.getCollection().distinct(field, query);
		} catch (err: any) {
			this.handleDbError(err.message);
		}
	}

	/**
	 * Update a record and $set data value by id
	 * @param id
	 * @param data
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async updateSetOneById(id: string | ObjectId, data: objectType) {
		if (!db_settings.id.isValid(id)) {
			return this.handleDbError(errorMessages.invalid_object_id);
		}
		if (!_.isEmpty(data) && _.isObject(data)) {
			data["updatedAt"] = new Date();
		}
		try {
			return await this.getCollection().updateOne(
				{ _id: BaseModel.toObjectId(id) },
				{
					$set: data,
				}
			);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * sanitize data for mongo, remove $ or . in object keys
	 * @param dataToSanitize
	 * @return {*}
	 */
	static sanitize(dataToSanitize: objectType) {
		if (_.isObject(dataToSanitize)) {
			_.each(dataToSanitize, (dataVal, dataKey) => {
				if (/^\$|\./.test(dataKey)) {
					delete dataToSanitize[dataKey];
				} else if (_.isString(dataVal)) {
					dataToSanitize[dataKey] = dataVal.trim();
				} else {
					BaseModel.sanitize(dataToSanitize[dataKey]);
				}
			});
		}
		return dataToSanitize;
	}
	/**
	 * convert string to object id
	 * @param id
	 * @return {*}
	 */
	static toObjectId(id: string | ObjectId) {
		return new db_settings.id(id.toString());
	}
	/**
	 * check if object id is valid
	 * @param id
	 * @return {boolean|*}
	 */
	isValidId(id: string | ObjectId) {
		try {
			return this.isValidMongoId(id);
		} catch (e) {
			return false;
		}
	}

	/**
	 * get a count of documents based on a query
	 * @param query
	 */
	/**
	 * @param query
	 * @return {Promise<number|*>}
	 */
	async count(query: objectType) {
		try {
			return this.getCollection().countDocuments(query);
		} catch (e) {}
		return 0;
	}
	/**
	 * find records based on query, and/or options or projections
	 * @param query
	 * @param options
	 * @return {Promise<*>}
	 */
	async aggregate(query: any, options: objectType) {
		return new Promise(async (resolve, reject) => {
			try {
				if (_.isUndefined(options)) {
					options = {
						allowDiskUse: true,
					};
				} else {
					options.allowDiskUse = true;
				}
				const response = await this.getCollection().aggregate(
					query,
					_.isUndefined(options) ? {} : options
				);
				resolve(response ? response.toArray() : []);
			} catch (e: any) {
				resolve(this.handleDbError(e.message));
			}
		});
	}
	/**
	 * find records based on query, and/or options or projections
	 * @param query
	 * @param options
	 * @return {Promise<*>}
	 */
	async find(query: objectType, options: objectType) {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await this.getCollection().find(
					query,
					_.isUndefined(options) ? {} : options
				);
				resolve(response ? response.toArray() : []);
			} catch (e: any) {
				resolve(this.handleDbError(e.message));
			}
		});
	}
	/**
	 * Return a record based on id
	 * findById
	 * @param id
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findById(id: string | ObjectId) {
		if (!this.isValidId(id)) {
			return this.handleDbError(errorMessages.invalid_object_id);
		}
		try {
			return this.getCollection().findOne({ _id: BaseModel.toObjectId(id) });
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Return a record based on column/key and value
	 * findByKeyValue
	 * @param column
	 * @param columnValue
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findByKeyValue(column: string, columnValue: any) {
		try {
			return this.getCollection().findOne({
				[column]: columnValue,
			});
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * find a record based on the supplied query and update that record with the supplied data
	 * @param findQuery
	 * @param updateData
	 * @param configData
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findOneAndUpdate(
		findQuery: objectType,
		updateData: objectType,
		configData: any = null
	) {
		try {
			if (!_.isUndefined(configData) && configData) {
				return this.getCollection().findOneAndUpdate(
					findQuery,
					updateData,
					configData
				);
			} else {
				return this.getCollection().findOneAndUpdate(findQuery, updateData);
			}
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * find a record based on the supplied query and update that record by unsetting the supplied data
	 * @param findQuery
	 * @param updateData
	 * @param configData
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findOneAndUpdateUnset(
		findQuery: objectType,
		updateData: objectType,
		configData: any
	) {
		try {
			return this.getCollection().findOneAndUpdate(
				findQuery,
				{
					$unset: updateData,
				},
				configData
			);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * find a record based on the supplied query and update that record by setting the supplied data
	 * @param findQuery
	 * @param updateData
	 * @param configData
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findOneAndUpdateSet(
		findQuery: objectType,
		updateData: objectType,
		configData: any
	) {
		if (!_.isEmpty(updateData) && _.isObject(updateData)) {
			updateData["updatedAt"] = new Date();
		}
		try {
			return this.getCollection().findOneAndUpdate(
				findQuery,
				{
					$set: updateData,
				},
				configData
			);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * find a record by mongo id and update it with the supplied data
	 * @param id
	 * @param updateData
	 * @param configData
	 * @return {Promise<T|{_db_error: *}>}
	 */
	async findOneAndUpdateById(
		id: string | ObjectId,
		updateData: objectType,
		configData: any = null
	) {
		if (this.isValidId(id)) {
			return this.findOneAndUpdate(
				{ _id: BaseModel.toObjectId(id) },
				updateData,
				configData
			);
		}
		return this.handleDbError(errorMessages.invalid_object_id);
	}
	/**
	 * find a record by mongo id and update it with the supplied data
	 * @param id
	 * @param updateData
	 * @param configData
	 * @return {Promise<T|{_db_error: *}>}
	 */
	async findOneAndUpdateSetById(
		id: string | ObjectId,
		updateData: objectType,
		configData: any = null
	) {
		if (this.isValidId(id)) {
			return this.findOneAndUpdateSet(
				{ _id: BaseModel.toObjectId(id) },
				updateData,
				configData
			);
		}
		return this.handleDbError(errorMessages.invalid_object_id);
	}
	/**
	 * Return a record based on query supplied
	 * @param query
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async findOne(query: objectType) {
		try {
			return this.getCollection().findOne(query);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}

	/**
	 * Find records with options for sort,limit,project etc;
	 * @param {*} query
	 * @param {*} options {sort, limit, project}
	 * @returns
	 */
	async findWithOptions(query: objectType, options: objectType) {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await this.getCollection()
					.find(query, _.has(options, "project") ? options.project : {})
					.sort(_.has(options, "sort") ? options.sort : {})
					.limit(
						_.has(options, "limit") && _.isFinite(options.limit)
							? options.limit
							: 1000
					);
				resolve(response ? response.toArray() : []);
			} catch (e: any) {
				resolve(this.handleDbError(e.message));
			}
		});
	}
	/**
	 * insert a record into the collection
	 * @param data
	 * @return {Promise<{_db_error: *}|{_id}|boolean>}
	 */
	async insertOne(data: objectType) {
		if (!_.isEmpty(data) && _.isObject(data)) {
			const currentDate = new Date();
			if (!_.has(data, "createdAt")) {
				data["createdAt"] = currentDate;
			}
			if (!_.has(data, "updatedAt")) {
				data["updatedAt"] = currentDate;
			}
		}
		try {
			const insertedData = await this.getCollection().insertOne(data);
			if (insertedData && insertedData.insertedId) {
				return { _id: insertedData.insertedId };
			}
			return !insertedData ? false : this.handleDbError(errorMessages.db_error);
		} catch (e:any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * insert a records into the collection
	 * @param data Array of JSON objects
	 * @return {Promise<{_db_error: *}|{_ids}|boolean>}
	 */
	async insertMany(data: objectType[]) {
		if (_.isEmpty(data) && !_.isArray(data))
			this.handleValidationError(
				"Data records must be a non empty array of objects"
			);
		try {
			const insertedData = await this.getCollection().insertMany(data);
			if (insertedData && insertedData.insertedIds)
				return { _ids: insertedData.insertedIds };
			return !insertedData ? false : this.handleDbError(errorMessages.db_error);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * delete records based on supplied query
	 * @param query
	 * @return {Promise<*>}
	 */
	async deleteMany(query: objectType) {
		try {
			return this.getCollection().deleteMany(query).catch(this.handleDbError);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * delete a record based on supplied query
	 * @param query
	 * @return {Promise<*>}
	 */
	async deleteOne(query: objectType) {
		try {
			const result: objectType = await this.getCollection().deleteOne(query);
			if (!_.isEmpty(result) && _.isObject(result) && _.has(result, "result")) {
				return result.result;
			}
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * delete a record based on supplied query
	 * @param query
	 * @return {Promise<*>}
	 */
	async removeOne(query: objectType) {
		try {
			return this.getCollection().removeOne(query).catch(this.handleDbError);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Update a record and unset value
	 * @param query
	 * @param data
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async updateUnsetOne(query: objectType, data: objectType) {
		try {
			return this.getCollection().update(query, {
				$unset: data,
			});
		} catch (e:any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Update a record based on the query and data supplied
	 * @param query
	 * @param data
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async updateOne(query: objectType, data: objectType) {
		if (!_.isEmpty(data) && _.isObject(data)) {
			data["updatedAt"] = new Date();
		}
		try {
			return this.getCollection().updateOne(query, { $set: data });
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Update a record based on the query and data supplied without $set
	 * @param query
	 * @param data
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async update(query: objectType, data: objectType) {
		try {
			return this.getCollection().updateOne(query, data);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Update multiple records based on the query and data supplied without $set
	 * @param query
	 * @param data
	 * @return {Promise<T | {_db_error: *}>}
	 */
	async updates(query: objectType, data: objectType) {
		try {
			return this.getCollection().updateMany(query, data);
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * update multiple records to the values supplied in data and based on the query supplied
	 * @param query
	 * @param data
	 * @return {Promise<*>}
	 */
	async updateMany(query: objectType, data: objectType) {
		if (!_.isEmpty(data) && _.isObject(data)) {
			data["updatedAt"] = new Date();
		}
		try {
			return this.getCollection().updateMany(query, { $set: data });
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * update multiple records by unsetting he values supplied in data and based on the query supplied
	 * @param query
	 * @param data
	 * @return {Promise<*>}
	 */
	async updateUnsetMany(query: objectType, data: objectType) {
		try {
			return this.getCollection().updateMany(query, { $unset: data });
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}
	/**
	 * Function that fetches paginated record from db
	 * @param opt {query: {}, skip: null, limit: null, sort: null, page: 1}
	 * {object} q Represents the query/filter to search the database for
	 * {number} skip Represents the number of records to skip
	 * {number} limit Represents the number of records to return. Defaults to 50 records
	 * {object} sort Represents the fields to sort the returned records with and the sorting order. defaults to updatedAt, createdAt, date in descending order
	 * {number} page Represents the page (within the records) to return. Used to calculate the number of records to skip
	 */
	async getPaginatedRecords(
		opt: objectType = { query: {}, skip: null, limit: null, sort: null, page: 1 }
	) {
		let query =
			_.isObject(opt) && !_.isEmpty(opt.query) && _.isObject(opt.query)
				? opt.query
				: {};
		let page = _.isObject(opt) && _.isFinite(opt.page) ? opt.page : 1;
		if (page < 1) page = 1;
		let limit = _.isObject(opt) && _.isFinite(opt.limit) ? opt.limit : 50;
		let skip =
			_.isObject(opt) && _.isFinite(opt.skip) ? opt.skip : (page - 1) * limit;
		let sort =
			_.isObject(opt) && !_.isEmpty(opt.sort) && _.isObject(opt.sort)
				? opt.sort
				: { updatedAt: -1 };
		let options = {
			limit,
			skip,
			sort,
		};

		const rtn = { records: [], totalRecords: 0, count: 0 };

		try {
			rtn.totalRecords = await this.getCollection().countDocuments();
			rtn.count = await this.getCollection().countDocuments(query);
			const records = await this.getCollection().find(query, options).toArray();
			if (!_.isEmpty(records)) {
				rtn.records = records;
			}
			return rtn;
		} catch (e: any) {
			return this.handleDbError(e.message);
		}
	}

	/**
	 * Function that bulk executes database operations.
	 * @param {array} operations the batch queries to execute.
	 * @returns {object} {success: true, data:any} or {success:false, errors:any} on success and error respectively
	 */
	async bulkWrite(operations: objectType[]) {
		if (_.isEmpty(operations) && !_.isArray(operations)) {
			return this.handleDbError(
				"Data record must be a non empty array of objects representing each operation to execute"
			);
		}
		try {
			const resp = await this.getCollection().bulkWrite(operations);
			if (!resp)
				return this.handleDbError(
					"There was an error while processing your request. Please try again later"
				);
			return resp;
		} catch (err: any) {
			return this.handleDbError(err.message);
		}
	}
	/**
	 * centralize db error handler
	 * @param error
	 * @return {{_db_error: *}}
	 */
	handleDbError(error: any) {
		return {
			_db_error: error,
		};
	}
	/**
	 * centralize validation error handler
	 * @param error
	 * @return {{_validation: *}}
	 */
	handleValidationError(error: any) {
		return { _db_validation_error: error };
	}

	objectToString(id: string | ObjectId) {
		return !_.isString(id) && this.isValidId(id) ? id.toString() : id;
	}
}

export default BaseModel;
