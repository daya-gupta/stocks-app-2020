'use strict';
const express = require('express');
const path = require('path');
const https = require('https');
const cors = require('cors');
const mongoose = require('mongoose');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
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
  companyId: {
    type: Number
  },
  url: {
    type: String
  }
});

mongoose.model('watchlist', watchlistSchema);

// Save the new model instance, passing a callback
// watchlistModel.save(function (err) {
//   if (err) console.log('schema error');
// });

const dbConfig = {
  "uri": "127.0.0.1",
  "port": "27017",
  "options": {
    "useNewUrlParser": true,
    "poolSize": 5,
    "connectTimeoutMS": 1000
  },
  "name": "testdb"
};

const prodUrl = 'mongodb://test-cosmos-1:bzRmqiwJi3pLAa7b2V4oA9qBuVd8FNwW2FtmWQi5EtISlo1nmxwd5IQAauWtYlCLM5Fs8UHITtjziFYZ2fkmlQ==@test-cosmos-1.mongo.cosmos.azure.com:10255/?ssl=true&appName=@test-cosmos-1@';
const localUrl = `mongodb://${dbConfig.uri}:${dbConfig.port}/${dbConfig.name}`;
const url = process.env.environment === 'production' ? prodUrl : localUrl;
let db = null;

mongoose.connect(url, dbConfig.options)
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
  
  app.get('/add', (req, res) => {
    // get data from mongo and send along
    const record = { name: 'infosys', companyId: '1234', url: '/infy' };
    db.collection('watchlist').find({}).toArray((err, data) => {
      if (err) {
        response += ' database error!!!'
        res.send(response);
      } else {
        const lastId = data.length ? Number(data[data.length - 1].companyId) : 10000;
        record.companyId = lastId + 1;
        db.collection('watchlist').insert(record).then(res => {
          res.send('success');
        });    
      }
    });
  });  
