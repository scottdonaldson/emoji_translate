var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    PORT = process.env.PORT || 8000;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use( '/js', express.static('js') );
app.use( '/css', express.static('css') );
app.use( '/img', express.static('img') );
app.use( '/data', express.static('data') );

app.get('/dictionary', function(req, res) {
    res.sendFile(path.join(__dirname, 'dictionary.html'));
});

app.post('/dictionary/edit', function(req, res) {
	console.log(req.body);
	res.redirect('/dictionary');
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(req, res) {
    res.status(404).send('Page not found');
});

module.exports = {
    start: function() {
        app.listen(PORT);
        console.log('Started server on port', PORT);
    }
};