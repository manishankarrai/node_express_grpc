const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Company =  require('../models/company.mode');
const mongoose  =  require('mongoose')
mongoose.connect('mongodb://localhost:27017/grpc_companies').then(()=> console.log("server is connected")).catch((err)=> console.log("db error" , err));


// Load the proto file
const packageDefinition = protoLoader.loadSync('../protos/second.proto');
const companyProto = grpc.loadPackageDefinition(packageDefinition);

// Mock database for companies
const COMPANIES = [
  { id: 1, name: 'TechCorp', address: '123 Silicon Valley', type: 'IT' },
  { id: 2, name: 'HealthPlus', address: '456 Wellness St.', type: 'Healthcare' },
  { id: 3, name: 'EduLearn', address: '789 Knowledge Ave.', type: 'Education' },
  { id: 4, name: 'FinSecure', address: '101 Money Blvd.', type: 'Finance' },
];

// Implement the Find RPC method
function findCompany(call, callback) {
  const name = call.request.name.toLowerCase(); // Search by company name
  const company = COMPANIES.find((comp) => comp.name.toLowerCase() === name);

  if (company) {
    callback(null, company);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      message: `Company with name "${call.request.name}" not found`,
    });
  }
}

const createCompany =  async (call, callback) => {
  try {
    const newCompany = new Company(call.request);
    console.log("abc " ,call.request);
    await newCompany.save();
    callback(null, newCompany.toObject());
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

 const getCompany =  async (call, callback) =>{
  try {
    console.log('id ss' , call.request);
    const company = await Company.findById(call.request._id );
    if (company) {
      callback(null, company.toObject());
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Company not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function updateCompany(call, callback) {
  try {
    const updatedCompany = await Company.findOneAndUpdate({ _id: call.request._id }, call.request, { new: true });
    if (updatedCompany) {
      callback(null, updatedCompany.toObject());
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Company not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function deleteCompany(call, callback) {
  try {
    const deletedCompany = await Company.findOneAndDelete({ _id: call.request._id });
    if (deletedCompany) {
      callback(null, {});
    } else {
      callback({ code: grpc.status.NOT_FOUND, message: 'Company not found' });
    }
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

 getAllCompany = async (call , callback) => {
     try {
         let company  = await Company.find() ;
         let companyList  =  company.map((e)=> e.toObject());
         callback(null , {companies :  companyList});
     } catch(err){
      callback({
        code: grpc.status.NOT_FOUND,
        message: `Company  not found`,
      });
     }
 }

// Create and start the gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(companyProto.getCompany.service, {
     Find: findCompany  ,
     Create : createCompany ,
     Read : getCompany , 
     Update : updateCompany , 
     Delete : deleteCompany , 
     List : getAllCompany ,
    });

  const port = '0.0.0.0:50052';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
    if (err) {
      console.error(`Failed to bind server: ${err.message}`);
      return;
    }
    console.log(`Server running at ${port}`);
    server.start();
  });
}

main();
