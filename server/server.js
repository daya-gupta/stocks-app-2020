'use strict';
const express = require('express');
const path = require('path');
const https = require('https');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const ObjectId = mongoose.Types.ObjectId;
const userId = '5ead1902a870ac38d18bd50c';
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

var userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

mongoose.model('user', userSchema);

var watchlistSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  default: {
    type: Boolean,
    default: false,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  }
});

mongoose.model('watchlist', watchlistSchema);

var companyListSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  companyId: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  watchlistId: {
    type: String,
    required: true,
  },
  comments: {
    type: String
  },
  userId: {
    type: String,
    required: true,
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

  const getMasterWatchlistData = (userId) => {
    const data = {
      _id: ObjectId().toString(),
      name: 'Master',
      color: '#fff',
      default: true,
      userId
    }
    return data;
  }

  app.post('/api/user', (req, res) => {
    const id = ObjectId();
    req.body._id = id.toString();
    db.collection('user').insertOne(req.body, (err, response) => {
      if (err) {
        return res.status(500).send(err);
      }
      console.log(response);
      // create master watchlist for the user
      const userId = response.insertedId;
      const masterWatchlistData = getMasterWatchlistData(userId);
      db.collection('watchlist').insertOne(masterWatchlistData, (err, response) => {
        if (err) {
          // do a roll back for user registration
          return res.status(500).send(err);
        }
        console.log(response);
        // create master watchlist for the user
        res.status(200).send({data: { message: 'User registered successfully.' }});
      });

    });
  });

  app.get('/api/user/:_id', (req, res) => {
    if (!req.params._id) {
      return res.status(500).send({message: 'User id not found'});
    }
    db.collection('user').findOne({_id: req.params._id}).then((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.post('/api/watchlist', (req, res) => {
    req.body._id = ObjectId().toString();
    req.body.userId = userId;
    db.collection('watchlist').insertOne(req.body, (err, response) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data: { message: 'Watchlist created successfully.' }});
    });
  });

  app.get('/api/watchlist', (req, res) => {
    const query = {userId};
    db.collection('watchlist').find(query).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.put('/api/watchlist/:_id', (req, res) => {
    db.collection('watchlist').updateOne({_id: req.params._id}, {$set: req.body}, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.put('/api/watchlist/active/:_id', (req, res) => {
    db.collection('watchlist').updateOne({userId, active: true}, {$set: {active: false}}, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      db.collection('watchlist').updateOne({userId, _id: req.params._id}, {$set: {active: true}}, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send(data);
      });  
    });
  });

  app.delete('/api/watchlist/:_id', (req, res) => {
    db.collection('watchlist').deleteOne({_id: req.params._id}, (err, response) => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({message: 'stock removed successfully'});
    });
  });

  app.post('/api/company', (req, res) => {
    req.body._id = ObjectId().toString();
    req.body.userId = userId;
    db.collection('company_list').insertOne(req.body, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.put('/api/company/:_id', (req, res) => {
    db.collection('company_list').updateOne({_id: req.params._id}, {$set: req.body}, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.delete('/api/company/:_id', (req, res) => {
    db.collection('company_list').deleteOne({_id: req.params._id}, (err, response) => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({message: 'stock removed successfully'});
    });
  });

  app.get('/api/company/watchlist/:watchlistId', (req, res) => {
    const query = { userId };
    if (req.params.watchlistId !== '0') {
      query.watchlistId = req.params.watchlistId;
    }
    db.collection('company_list').find(query).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });
  
  // app.get('/api/company/:_id', (req, res) => {
  //   db.collection('company_list').findOne({_id: req.params._id}, (err, data) => {
  //     if (err) {
  //       return res.error(err);
  //     }
  //     res.status(200).send({data});
  //   });
  // });

  