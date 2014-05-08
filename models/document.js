/**
 * New node file
 */
exports.createModel = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	//Document schema definition
	var documentSchema = new Schema({
		_id		 : String,
		name	 : {type: String,  default: 'Unknown'},
		created	 : {type: Date,    default: Date.now},
		isPublic : {type: Boolean, default: false},
		users	 : [String]
	});
	
	return mongoose.model('Document', documentSchema);
}