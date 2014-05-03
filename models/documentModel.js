/**
 * New node file
 */
exports.createModel = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	//Document schema definition
	var documentSchema = new Schema({
		id 		 : ObjectId,
		name 	 : {type: String, default: 'Unknown'},
		content	 : {type: String, default: ''},
		created  : {type: Date,   default: Date.now},
		modified : {type: Date,   default: Date.now}
	});
	
	return mongoose.model('Document', documentSchema);
}