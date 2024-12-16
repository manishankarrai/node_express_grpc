const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, required: true },
} , { timestamps: true   } );

module.exports = mongoose.model('companies', CompanySchema);
