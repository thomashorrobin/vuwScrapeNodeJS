var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var app     = express();

mongoose.connect('mongodb://localhost/test');

app.get('/', function(req, res){
	url = 'http://www.victoria.ac.nz/courses/econ/202?year=2014';

	request(url, function(error, response, html){
		if (!error) {
			var $ = cheerio.load(html);

			var name ,crn, dit;

			var json = { name: "", crn: "", terms: [] }

			$('.page_title').filter(function(){
				var data = $(this);
				name = data.text();
				json.name = name;
			})

			$('.course_page').filter(function(){
				var data = $(this);
				crn = data.children('h2').first().text();
				json.crn = crn;
				var ls = data.children();
				for(var i = 0; i < ls.length; i++){
					var d = ls.eq(i).text();
					if(d.substring(0,8) === "Teaching"){
						var term = { dates: "", lectures: [] }
						term.dates = ls.eq(i).text();
						var lectures = ls.eq(i + 1).children();
						for (var j = 0; j < lectures.length; j++) {
							var lecture = {day : "", time: "", room:""};
							lecture.day = lectures.children().first().children().eq(0).text();
							lecture.time = lectures.children().first().children().eq(1).text();
							lecture.room = lectures.children().first().children().eq(2).text();
							term.lectures.push(lecture);
						};
						json.terms.push(term);
					}
				}
			})

			fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
	        	console.log('File successfully written! - Check your project directory for the output.json file');
	        })

			res.send(json);
		};
	})
})

app.get('/scrape', function(req, res){
	// Let's scrape Anchorman 2
	url = 'http://www.imdb.com/title/tt1229340/';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var title, release, rating;
			var json = { title : "", release : "", rating : ""};

			$('.header').filter(function(){
		        var data = $(this);
		        title = data.children().first().text();
		        release = data.children().last().children().text();

		        json.title = title;
		        json.release = release;
	        })

	        $('.star-box-giga-star').filter(function(){
	        	var data = $(this);
	        	rating = data.text();

	        	json.rating = rating;
	        })
		}

		fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        	console.log('File successfully written! - Check your project directory for the output.json file');
        })

		res.send(json);
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app; 	
