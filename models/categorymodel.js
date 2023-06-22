const mongoose= require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryname: {
    type: String,
    required: true,
    unique: true,
  },

});

const category = mongoose.model('category', categorySchema);

module.exports =category