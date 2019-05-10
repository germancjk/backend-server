var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({

    nombre: { type: String, require: [true, 'Nombre de hospital necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);