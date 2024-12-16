const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(express.json());

// Load gRPC Protos
const employeePackageDef = protoLoader.loadSync(path.join(__dirname, './protos/first.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const companyPackageDef = protoLoader.loadSync(path.join(__dirname, './protos/second.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const employeeProto = grpc.loadPackageDefinition(employeePackageDef);
const companyProto = grpc.loadPackageDefinition(companyPackageDef);

// Create gRPC Clients
const employeeClient = new employeeProto.getEmployee('localhost:50051', grpc.credentials.createInsecure());
const companyClient = new companyProto.getCompany('localhost:50052', grpc.credentials.createInsecure());



app.get('/' , (req , res)=>{
      res.status(200).send({ message : "working fine"});
});

app.post('/employees', (req, res) => {
  employeeClient.Create(req.body, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(response);
  });
});

app.get('/employees/:id', (req, res) => {
  const employeeId = { _id:  req.params.id  };
  console.log('_id' , employeeId)
  employeeClient.Read(employeeId, (err, response) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

app.put('/employees/:id', (req, res) => {
  const employee = { ...req.body, _id: req.params.id  };
  employeeClient.Update(employee, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});


app.delete('/employees/:id', (req, res) => {
  const employeeId = { _id: req.params.id  };
  employeeClient.Delete(employeeId, (err) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send({message : "success"});
  });
});

// List All Employees
app.get('/employees', (req, res) => {
  employeeClient.List({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.employees);
  });
});

app.post('/companies', (req, res) => {
  companyClient.Create(req.body, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(response);
  });
});

app.get('/companies/:id', (req, res) => {
  const companyId = { _id: req.params.id };
  companyClient.Read(companyId, (err, response) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

app.put('/companies/:id', (req, res) => {
  const company = { ...req.body, _id: req.params.id };
  companyClient.Update(company, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

app.delete('/companies/:id', (req, res) => {
  const companyId = { _id: req.params.id };
  companyClient.Delete(companyId, (err) => {
    if (err) {
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send({ message: "success" });
  });
});

app.get('/companies', (req, res) => {
  companyClient.List({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.companies);
  });
});


// Routes for Company Service
app.get('/company/:name', (req, res) => {
  const name = req.params.name;

  companyClient.Find({ name }, (err, response) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(response);
    }
  });
});

app.all('*', (req, res) => {
  res.status(404).send({ message: "route not found" });
});
// Start Gateway
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});
