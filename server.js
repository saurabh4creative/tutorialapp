var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var mongoose = require('mongoose');


app.use(bodyParser.json()); // Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public')); // Allow front end to access public folder
app.use('/api', appRoutes);

// Application send jome page layout
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html')); // Set index.html as layout
});

mongoose.connect('mongodb://127.0.0.1:27017/final', function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err); // Log to console if unable to connect to database
    } else {
        console.log('Successfully connected to MongoDB'); // Log to console if able to connect to database
    }
});

// Server listen port...
var port = 4000;
app.listen(port, function () {
	console.log('Server Running on port ' +port);
});