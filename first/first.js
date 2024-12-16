const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Employee = require('../models/employee.model');

mongoose.connect('mongodb://localhost:27017/grpc_employees').then(()=> console.log("server is connected")).catch((err)=> console.log("db error" , err));

// Load the proto file
const packageDefinition = protoLoader.loadSync('../protos/first.proto');
const employeeProto = grpc.loadPackageDefinition(packageDefinition);


// Mock database for employees
const EMPLOYEES = [
  { id: 1, firstName: 'John', lastName: 'Doe', department: 'Engineering' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', department: 'Human Resources' },
  { id: 3, firstName: 'Emily', lastName: 'Johnson', department: 'Finance' },
  { id: 4, firstName: 'Michael', lastName: 'Brown', department: 'IT' },
];

async function createEmployee(call, callback) {
  try {
    const newEmployee = new Employee(call.request);
    console.log("abc " ,call.request);
    await newEmployee.save();
    callback(null, newEmployee.toObject());
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function readEmployee(call, callback) {
  try {
    console.log('id ss' , call.request);
    const employee = await Employee.findById(call.request._id );
    if (employee) {
      callback(null, employee.toObject());
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Employee not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function updateEmployee(call, callback) {
  try {
    const updatedEmployee = await Employee.findOneAndUpdate({ _id: call.request._id }, call.request, { new: true });
    if (updatedEmployee) {
      callback(null, updatedEmployee.toObject());
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Employee not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function deleteEmployee(call, callback) {
  try {
    const deletedEmployee = await Employee.findOneAndDelete({ _id: call.request._id });
    if (deletedEmployee) {
      callback(null, {});
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Employee not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function listEmployees(call, callback) {
  try {
    const employees = await Employee.find();
    callback(null, { employees: employees.map((e) => e.toObject()) });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(employeeProto.getEmployee.service, {
    Create: createEmployee,
    Read: readEmployee,
    Update: updateEmployee,
    Delete: deleteEmployee,
    List: listEmployees,
  });

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Employee server running on 0.0.0.0:50051');
    server.start();
  });
}


main();
