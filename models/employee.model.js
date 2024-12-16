const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
},{ timestamps: true  } );

module.exports = mongoose.model('employees', EmployeeSchema);
