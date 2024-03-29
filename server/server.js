'use strict';
const express = require('express');
const path = require('path');
const https = require('https');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const ObjectId = mongoose.Types.ObjectId;
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

let sseRes = null;

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
});

app.get('/api/bseReturn', (req, res) => {
  // const data = req.query.data;
  // const url = 'https://www.bloombergquint.com/feapi/markets/indices/historical-returns?tab=bse';
  // https.get(url, (resp) => {
  //     let data = '';

  //     resp.on('data', (chunk) => {
  //         data += chunk;
  //     });

  //     resp.on('end', () => {
  //         res.send(JSON.parse(data));
  //     });

  // }).on("error", (err) => {
  //     console.log("Error: " + err.message);
  // });
  res.send({ data: [] });
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
    res.status(500).send('Invalid request for ', companyId);
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

var portfolioSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  buyDate: {
    type: Date,
    required: true,
  },
  sellDate: {
    type: Date,
  },
  quantity: {
    type: Number,
    required: true,
  },
  buyPrice: {
    type: Number,
    required: true,
  },
  sellPrice: {
    type: Number,
  },
  comments: {
    type: String
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  }
});

mongoose.model('portfolio', portfolioSchema);

var optionNiftySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  callTotal: {
    type: Number,
    required: true,
  },
  putTotal: {
    type: Number,
    required: true,
  },
  callTotal2: {
    type: Number,
    required: true,
  },
  putTotal2: {
    type: Number,
    required: true,
  },
});

mongoose.model('option_nifty', optionNiftySchema);
mongoose.model('option_bank_nifty', optionNiftySchema);

var optionNiftyArraySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  callArray: {
    type: Array,
    required: true,
  },
  putArray: {
    type: Array,
    required: true,
  },
  strikeArray: {
    type: Array,
    required: true,
  },
  underlyingValue: {
    type: String,
    required: false,
  }
});

mongoose.model('option_nifty_array', optionNiftyArraySchema);
mongoose.model('option_bank_nifty_array', optionNiftyArraySchema);

var optionStockArraySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  callArray: {
    type: Array,
    required: true,
  },
  putArray: {
    type: Array,
    required: true,
  },
  underlyingValue: {
    type: String,
    required: false,
  },
  stockSymbol: {
    type: String,
    required: true
  }
});

mongoose.model('option_stock_array', optionStockArraySchema);


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
// const dbUrl = process.env.dbUrl;
const dbUrl = 'mongodb+srv://atlas-stocks:123456pP@cluster0.azsog.mongodb.net/stocks';
console.log(dbUrl, '-----------------');
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

  const getWatchlistData = (userId, name) => {
    const data = {
      _id: ObjectId().toString(),
      name,
      default: name === 'Primary',
      userId
    }
    return data;
  }

  app.post('/api/user/register', (req, res) => {
    const id = ObjectId();
    req.body._id = id.toString();
    db.collection('user').insertOne(req.body, (err, response) => {
      if (err) {
        return res.status(500).send(err);
      }
      // create watchlists (master, primary, negative) for the user
      const userId = response.insertedId;
      const masterWatchlistData = getWatchlistData(userId, 'Master');
      const primaryWatchlistData = getWatchlistData(userId, 'Primary');
      const negativeWatchlistData = getWatchlistData(userId, 'Negative');
      db.collection('watchlist').insertMany([masterWatchlistData, primaryWatchlistData, negativeWatchlistData], (err, response) => {
        if (err) {
          // do a roll back for user registration
          return res.status(500).send(err);
        }
        // create master watchlist for the user
        res.status(200).send({data: { message: 'User registered successfully.' }});
      });
    });
  });

  app.get('/api/user', (req, res) => {
    db.collection('user').find({}).toArray((err, response) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data: response});
    });
  });

  app.get('/api/user/:_id', (req, res) => {
    if (!req.params._id) {
      return res.status(500).send({message: 'User id not found'});
    }
    const userId = req.params._id;
    db.collection('user').find({_id: userId}).then((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.post('/api/watchlist', (req, res) => {
    req.body._id = ObjectId().toString();
    db.collection('watchlist').insertOne(req.body, (err, response) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data: { message: 'Watchlist created successfully.' }});
    });
  });

  app.get('/api/watchlist/:userId', (req, res) => {
    const query = {userId: req.params.userId};
    db.collection('watchlist').find(query).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.put('/api/watchlist/:watchlistId', (req, res) => {
    const watchlistId = req.params.watchlistId;
    db.collection('watchlist').updateOne({_id: watchlistId}, {$set: req.body}, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.put('/api/watchlist/active/:watchlistId', (req, res) => {
    const userId = req.body.userId;
    const watchlistId = req.params.watchlistId;
    db.collection('watchlist').updateOne({userId, active: true}, {$set: {active: false}}, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      db.collection('watchlist').updateOne({userId, _id: watchlistId}, {$set: {active: true}}, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send(data);
      });  
    });
  });

  app.delete('/api/watchlist/:watchlistId', (req, res) => {
    const watchlistId = req.params.watchlistId;
    db.collection('watchlist').deleteOne({_id: watchlistId}, (err, response) => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({message: 'stock removed successfully'});
    });
  });

  app.post('/api/company', (req, res) => {
    req.body._id = ObjectId().toString();
    db.collection('company_list').insertOne(req.body, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.post('/api/portfolio/company', (req, res) => {
    req.body._id = ObjectId().toString();
    db.collection('portfolio').insertOne(req.body, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.put('/api/portfolio/company', (req, res) => {
    // req.body._id = ObjectId().toString();
    db.collection('portfolio').updateOne({ _id: req.body._id }, {$set: req.body}, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.get('/api/portfolio/:userId/:positionType', (req, res) => {
    // const query = {userId: req.params.userId, isOpen: req.params.type === 'open' ? true : false};
    const query = {userId: req.params.userId, isOpen: req.params.positionType === 'open' ? true : false};
    db.collection('portfolio').find(query).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.put('/api/company/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    db.collection('company_list').updateOne({_id: companyId}, {$set: req.body}, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.delete('/api/company/:companyId', (req, res) => {
    const companyId = req.params.companyId;
    db.collection('company_list').deleteOne({_id: companyId}, (err, response) => {
      if (err) {
        res.error(err);
      }
      res.status(200).send({message: 'stock removed successfully'});
    });
  });

  // function countdown(res, count) {
  //   res.write("data: " + count + "\n\n")
  //   if (count)
  //     setTimeout(() => countdown(res, count-1), 2000)
  //   else
  //     res.end();
  // }

  app.get('/api/countdown', function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    sseRes = res;
    sseRes.write("data: " + 1 + "\n\n")
    // countdown(res, 10)
  })
  
  app.get('/api/setOptionData', (req, res) => {
    const { callTotal, putTotal, callTotal2, putTotal2, timestamp, type = '' } = req.query;
    const data = {
      _id: ObjectId().toString(),
      callTotal,
      putTotal,
      callTotal2,
      putTotal2,
      timestamp,
    }
    // const companyId = req.params.companyId;
    // res.status(200).send({message: 'works'});
    let collectionName = 'option_nifty';
    if (type.toLocaleLowerCase() === 'bank_nifty') {
      collectionName = 'option_bank_nifty';
    }
    db.collection(collectionName).insertOne(data, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send({data});
    });
  });

  app.get('/api/setOptionDataArray', (req, res) => {
    const { callArray, putArray, strikeArray, type = 'nifty', underlyingValue, stockSymbol } = req.query;
    const data = {
      _id: ObjectId().toString(),
      callArray: JSON.parse(callArray),
      putArray: JSON.parse(putArray),
      strikeArray: JSON.parse(strikeArray),
      timestamp: new Date(),
      underlyingValue,
    }
    // sseRes && sseRes.write("data: " + JSON.stringify(req.query) + "\n\n");
      
    // const companyId = req.params.companyId;
    // res.status(200).send({message: 'works'});
    let collectionName = 'option_nifty_array';
    if (type.toLocaleLowerCase() === 'bank_nifty') {
      collectionName = 'option_bank_nifty_array';
    } else if (type.toLocaleLowerCase() === 'stock') {
      collectionName = 'option_stock_array';
      data.stockSymbol = stockSymbol;
    }
    db.collection(collectionName).insertOne(data, (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      // sseRes.write("data: " + JSON.stringify(data.ops[0]) + "\n\n")
      // res.end();
      res.status(200).send({data});
    });
  });

  app.get('/api/getOptionData', (req, res) => {
    const { type = '' } = req.query;
    let collectionName = 'option_nifty';
    if (type.toLocaleLowerCase() === 'bank_nifty') {
      collectionName = 'option_bank_nifty';
    }
    db.collection(collectionName).find({}).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.get('/api/getOptionDataArray', (req, res) => {
    const { type = '', stockSymbol, fromDate, toDate } = req.query;
    let collectionName = 'option_nifty_array';
    // const dbQuery = {};
    const dbQuery = { $and: [{timestamp: { $gte: new Date(fromDate) }}, {timestamp: { $lte: new Date(toDate) }}] };
    if (type.toLocaleLowerCase() === 'bank_nifty') {
      collectionName = 'option_bank_nifty_array';
    } else if (type.toLocaleLowerCase() === 'stock') {
      collectionName = 'option_stock_array';
      dbQuery.stockSymbol = stockSymbol;
    }
    
    db.collection(collectionName).find(dbQuery).toArray((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(data);
    });
  });

  app.get('/api/company/watchlist/:watchlistId/:userId', (req, res) => {
    // for master-watchlist show data from primary and smallcap both
    if (req.params.watchlistId === '0') {
      let query = {userId: req.params.userId};
      db.collection('watchlist').find(query).toArray((err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        const primaryWatchlist = data.find((item) => item.name === 'Primary');
        const smallcapWatchlist = data.find((item) => item.name === 'Smallcap');
        query = {
          $or: [
            { watchlistId: primaryWatchlist._id },
            { watchlistId: smallcapWatchlist._id }
          ]
        };
        db.collection('company_list').find(query).toArray((e, d) => {
          if (e) {
            return res.status(500).send(e);
          }
          res.status(200).send(d);
        });
      });  
    } else {
      const query = {};
      query.watchlistId = req.params.watchlistId;
      db.collection('company_list').find(query).toArray((err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send(data);
      });
    }
  });
  
  // app.get('/api/company/:_id', (req, res) => {
  //   db.collection('company_list').findOne({_id: req.params._id}, (err, data) => {
  //     if (err) {
  //       return res.error(err);
  //     }
  //     res.status(200).send({data});
  //   });
  // });
