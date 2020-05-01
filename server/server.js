'use strict';
const express = require('express');
const path = require('path');
const https = require('https');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const environment = process.env.ENVIRONMENT || 'dev';

console.log('HOST', process.env.HOST, process.env.ENVIRONMENT);
// process.chdir(__dirname);
const configPath = path.resolve(__dirname, 'config', `${environment}.env`)
const result = dotenv.config({ path: configPath });
if (result.error) console.log(result.error);

// console.log('HOST', process.env.HOST);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'build')));
// app.use(express.static('build'));

app.get('/index', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

app.get('/consolidatedData', (req, res) => {
  const url = req.query.url;
  try {
    https.get(`https://www.screener.in/${url}`, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
          data += chunk;
      });

      resp.on('end', () => {
          res.send(data);
      });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
  }
  catch (e) {
    res.status(500).send('Invalid request');
  }
})

app.get('/searchCompany', (req, res) => {
  const data = req.query.data;
  https.get(`https://www.screener.in/api/company/search/?q=${data}`, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
          data += chunk;
      });

      resp.on('end', () => {
          res.send(JSON.parse(data));
      });

  }).on("error", (err) => {
      console.log("Error: " + err.message);
  });
})


app.get('/historicalData', (req, res) => {
  const companyId = req.query.companyId;
  const duration = req.query.duration || 356;
  try {
    https.get(`https://www.screener.in/api/company/${companyId}/chart/?q=Price-Volume&days=${duration}`, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            res.send(JSON.parse(data));
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
  } catch (e) {
    res.status(500).send('Invalid request');
  }
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// Mongoose connection

var watchlistSchema = new mongoose.Schema({
  name: {
    type: String
  },
  color: {
    type: String
  }
});

mongoose.model('watchlists', watchlistSchema)

var companyListSchema = new mongoose.Schema({
  name: {
    type: String
  },
  companyId: {
    type: Number
  },
  url: {
    type: String
  },
  watchlistName: {
    type: String
  },
  comments: {
    type: String
  }
});

mongoose.model('company_list', companyListSchema);

// Save the new model instance, passing a callback
// watchlistModel.save(function (err) {
//   if (err) console.log('schema error');
// });

// const dbConfig={
//   "uri": "127.0.0.1",
//   "port": "27017",
//   "options": {
//     "useNewUrlParser": true,
//     "poolSize": 5,
//     "connectTimeoutMS": 1000
//   },
//   "name": "testdb"
// };

const dbConfig = {
  options: {
    "useNewUrlParser": true,
    "poolSize": 5,
    "connectTimeoutMS": 1000
  }
};

// const prodUrl = 'mongodb://test-cosmos-1:bzRmqiwJi3pLAa7b2V4oA9qBuVd8FNwW2FtmWQi5EtISlo1nmxwd5IQAauWtYlCLM5Fs8UHITtjziFYZ2fkmlQ==@test-cosmos-1.mongo.cosmos.azure.com:10255/?ssl=true&appName=@test-cosmos-1@';
// const localUrl = `mongodb://${dbConfig.uri}:${dbConfig.port}/${dbConfig.name}`;
// const dbUrl = process.env.environment === 'production' ? prodUrl : localUrl;
const dbUrl = process.env.dbUrl;
let db = null;

mongoose.connect(dbUrl, dbConfig.options)
  .then(()=> {
    console.log(`Connected to mongodb successfully`);
    db = mongoose.connection;
  })
  .catch(()=> {
    console.log(`Error while connecting to ${dbConfig.name}`);
  });

  app.get('/list', (req, res) => {
    let response = 'hello there 5555 !!';
    db.collection('watchlist').find({}).toArray((err, data) => {
      if (err) {
        response += ' database error!!!'
        res.send(response);
      } else {
        data.forEach(function(d){
          response += `\n ${d.name} ${d.url} ${d.companyId}`;
        });
        res.send('<h1>' + response + '</h1>');
      }
    }); 
  });

  app.get('/api/getCompanies', (req, res) => {
    db.collection('company_list').find({}).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });
  
  app.get('/api/company/:id', (req, res) => {
    db.collection('company_list').findOne({id: req.param.id}).then((err, data) => {
      if (err) {
        return res.error(err);
      }
      res.status(200).send({data});
    });
  });

  app.post('/api/company/:id', (req, res) => {
    db.collection('company_list').insertOne(req.body).then(err => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data: {}});
    });
  });

  app.put('/api/company/:id', (req, res) => {
    db.collection('company_list').update({id: res.params.id}, req.body).then(err => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({data: {}});
    });
  });

  app.delete('/api/company/:id', (req, res) => {
    db.collection('company_list').deleteOne({id: req.params.id}).then(err => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({data: {}});
    });
  });
