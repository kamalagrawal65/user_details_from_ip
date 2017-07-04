const express = require('express')
const app = express();
var path = require('path');
var engines = require('consolidate');
const ip2loc = require("ip2location-nodejs");
const myIP = require("my-ip");
const externalip = require("externalip");
var MongoClient = require('mongodb').MongoClient;
// for parsing sent data
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());

// view engine setup
app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use('/static',express.static('./static')).use('/lib',express.static('../lib'));

// Binary file for determining location
ip2loc.IP2Location_init("IP-COUNTRY-REGION-CITY-LATITUDE-LONGITUDE-ZIPCODE-TIMEZONE-ISP-DOMAIN-NETSPEED-AREACODE-WEATHER-MOBILE-ELEVATION-USAGETYPE-SAMPLE.BIN");

app.post('/background', function(req,res){
	var error = req.body.error;
	var error_value = req.body.error_value;
	var entry_time = req.body.entry_time;
	var current_url = req.body.current_url;
	var leave_time = req.body.leave_time;
	var local_ip = req.body.local_ip;
	var public_ip, country_short, country_long, region, city, timezone;
	
	let keepPromise = new Promise((resolve, reject) => {
		externalip(function (err, ip) {
			result = ip2loc.IP2Location_get_all(ip);
			public_ip = result["ip"];
			country_short = result["country_short"];
			country_long = result["country_long"];
			region = result["region"];
			city = result["city"];
			timezone = result["timezone"];
			resolve({'public_ip': public_ip, 'country_short':country_short, 'country_long':country_long, 'region':region,
						'city': city, 'timezone': timezone});
		});
	});
	
	keepPromise.then((result) => {
		// Connect to mongo and insert
		MongoClient.connect("mongodb://localhost:27017/user_details", function(err, db) {
			if(err) { return console.log(err); }
			var collection = db.collection('user_information');
			var doc1 = { 'error': error, 'error_value': error_value, 'entry_time': entry_time, 'leave_time': leave_time, 
						'current_url': current_url, 'local_ip': local_ip, 'public_ip': result.public_ip, 
						'country_short': result.country_short, 'country_long': result.country_long, 'region': result.region,
						'city': result.city, 'timezone': result.timezone};
			collection.insert(doc1);
		});
	});	
	
});

app.get('/', function (req, res) {
	res.render('index');	
});

app.listen(3000, function () {
  console.log('Listening on port 3000!')
});