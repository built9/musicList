let Config = require('./config.js');
var MongoDB = require('mongodb');
let MongoClient = require('mongodb').MongoClient;
const ObjectID = MongoDB.ObjectID;

class Db {
	static getInstance() {
		if (!Db.instance) {
			Db.instance = new Db()
		}
		return Db.instance;
	}
	constructor() {
		console.log('链接数据库')
		this.dbClient = ''
		this.connect()
	}
	connect() {
		//解决异步问题，后期来调用的时候，使用await,then；
		//判断第一次有没有连接，如果说没有连接的情况，进行连接
		return new Promise((resolve, reject) => {
			if (this.dbClient) {
				resolve(this.dbClient)
			} else {
				MongoClient.connect(Config.dbUrl, {
					useNewUrlParser: true,
					useUnifiedTopology: true
				}, (err, client) => {
					if (err) {
						console.log(123)
						console.log(err);
						return;
					} else {
						// console.log( 123 )
						// let db=client.db(Config.dbName)
						// resolve(db) //执行成功的时候，返回对象；

						this.dbClient = client.db(Config.dbName)
						resolve(this.dbClient)

					}
				})
			}
		})
	}
	find(collectionName, json) {
		// console.log( 'find' )
		return new Promise((resolve, reject) => {
			this.connect().then((db) => {
				// console.log( db )
				let result = db.collection(collectionName).find(json);
				// console.log( db.collection(collectionName).find(json) )
				//这一步的操作是读取到数据库里面的信息，返回数组对象；
				result.toArray((err, doc) => {
					// console.log( doc )
					if (err) {
						reject(err)
						return;
					}
					resolve(doc)
				})
			})
			// console.log( 123 )
		})

	}
	//增加
	insert(collectionName, json) {
		return new Promise((resolve, reject) => {
			this.connect().then((db) => {
				db.collection(collectionName).insertOne(json, function(err, result) {
					if (err) {
						reject(err)
					} else {
						resolve(result)
					}
				})
			})
		})
	}
	insertAutoId(collectionName, json) {
		return new Promise((resolve, reject) => {
			console.log('auto', json)
			let jsonData = json
			jsonData.id = this.getNextSequenceValue(json.id)
			this.connect().then((db) => {
				db.collection(collectionName).insertOne(jsonData, function(err, result) {
					if (err) {
						reject(err)
					} else {
						resolve(result)
					}
				})
			})
		})
	}
	//修改 : json1为修改前，json2为修改后的数据
	update(collectionName, json1, json2) {
		// console.log( "update" )
		return new Promise((resolve, reject) => {

			this.connect().then((db) => {
				db.collection(collectionName).updateOne(json1, {
					$set: json2
				}, (err, result) => {
					if (err) {
						reject(err)
					} else {
						resolve(result)
					}
				})
			})
		})
	}
	//删除
	remove(collectionName, json) {
		return new Promise((resolve, reject) => {
			this.connect().then((db) => {
				db.collection(collectionName).removeOne(json, (err, result) => {
					if (err) {
						reject(err)
					} else {
						resolve(result)
					}
				})
			})
		})
	}
	//封装，调用;【固定的写法，用于获取_id值】
	getObjectId(id) {
		return new ObjectID(id)
	}
	// 自增id
	getNextSequenceValue(sequenceName) {
		return new Promise((resolve, reject) => {
			this.connect().then((db) => {
				var sequenceDocument = db.collection('counters').findOneAndUpdate(
					{
						_id: sequenceName
					},
					{
						'$inc': {
							sequence_value: 1
						}
					},
					{ returnNewDocument : true,projection: { "sequence_value" : 1 },upsert:true}
				).then(( result)=>{
				console.log('sequenceDocument111',result)
resolve(result.value.sequence_value)
				})
				
			})
		})
	}
}

// 如果需要外部调用，需要将接口暴露出去
module.exports = Db.getInstance();
