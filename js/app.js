'use strict';
var map;
var infoWindow;
var geocoder;

// Display an error message if map fails to load
var googleMapError = function() {
	console.log('Failed to load Google Map. Please try again later.');
	alert('Failed to load Google Map. Please try again later.');
};

// Initiazlie map and set up ViewModel
var initMap = function(){
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.759, lng: -122.423},
		zoom: 16
	});
	geocoder = new google.maps.Geocoder();
	// Use only one InfoWindow to keep max of one open at a time
	infoWindow = new google.maps.InfoWindow({
		content: null
	});
	ko.applyBindings(new ViewModel());
};

// Get information from NYTimes about each location
// var NYTimes = function(location) {
// 	var nytURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + location.name() + '&sort=newest&api-key=3ee99f8f736242c18f89225585db60a4';
// 	$.getJSON(nytURL, function(data) {
// 		var nytElem = ('<h3>New York Times Articles About ' + location.name() + '</h3><ul>');
// 		var articles = data.response.docs;
// 		if (!articles) {
// 			nytElem += '<li class="error">Data not available</li>';
// 		}
// 		else {
// 			for (var i = 0; i < articles.length; i++) {
// 				var article = articles[i];
// 				nytElem += '<li class="article">' + '<a href="' + article.web_url + '" target="_blank">' + article.headline.main + '</a>' + '<p>' + article.snippet + '</p>' + '</li>';
// 			}
// 		}
// 		infoWindow.setContent(nytElem);
// 	}).fail(function(e) {
// 		var nytElem = 'New York Times Articles Could Not Be Loaded';
// 		infoWindow.setContent(nytElem);
// 	});
// };

// Locations on the map
var initialLocations = [
	{
		name: 'Taqueria Los Coyotes',
		address: '3036 16th St, San Francisco, CA 94103',
		rating: 4,
		review: 'This one has a special place in my heart for being the only taqueria in SF to have the California burrito - a San Diegan masterpiece of carne asada, pico de gallo, avocado, sour cream, and french fries. It’s not quite as good as the ones you’ll get down South, but it comes close. Unfortunately, it’s other San Diegan delicacy - carne asada fries - leaves much to be desired.'
	},
	{
		name: 'Taqueria Cancun',
		address: '2288 Mission St, San Francisco, CA 94110',
		rating: 4,
		review: 'A standard of the central Mission, Cancun can be hit or miss depending on the time of day and how many drunk people have invaded the space. The classic Mission-style burritos are excellent - and the size of a small child - but the quality can really drop late in the day. They’re open late, which is great when your 1:30 drunk munchies kick in but be warned: this place is cash only.'
	},
	{
		name: 'Taqueria El Buen Sabor',
		address: '699 Valencia St, San Francisco, CA 94110',
		rating: 3,
		review: 'As the main taqueria along the bougiest blocks of Valencia, El Buen Sabor sacrifices the guttural style of most other taquerias in favor of a decidedly less greasy smattering of options. The burritos are smaller (but just as pricey) as elsewhere and overall the food just isn’t as good as other nearby spots. But they do have a nice, lighter quesadilla and their breakfast burrito is excellent.'
	},
	{
		name: 'Pancho Villa Taqueria',
		address: '3071 16th St, San Francisco, CA 94103',
		rating: 5,
		review: 'Pancho Villa has managed to take everything that is great about the Mission burrito and expand on it. Their ingredients are incredibly fresh and meat wonderfully flavorful, but what really makes this the best spot in town is their unique technique of mixing your choice of salsa into your burrito. This is a beauty for spice-loving Mission residents who are tired of the district’s overall not-spicy-enough food.'
	},
	{
		name: 'Taqueria El Farolito',
		address: '2779 Mission St, San Francisco, CA 94110',
		rating: 5,
		review: ''
	},
	{
		name: 'Taqueria El Toro',
		address: '598 Valencia St, San Francisco, CA 94110',
		rating: 3,
		review: 'Don’t go to El Toro expecting the best burrito, but do go and get a plate of their excellent enchiladas. This is an excellent place to hit up when you get tired of the usual burrito fare (blasphemy, I know). '
	},
	{
		name: 'La Taqueria',
		address: '2889 Mission St, San Francisco, CA 94110',
		rating: 5,
		review: ''
	}
];

// Knockout model for locations
// Also makes markers and InfoWindows
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.address = data.address;
	this.rating = data.rating;
	this.review = data.review;
	this.visible = ko.observable(true);
	geocoder.geocode({'address': this.address}, function(results, status) {
		if (status == 'OK') {
			self.marker = new google.maps.Marker({
				title: self.name,
				position: results[0].geometry.location,
				map: map
			});
			self.marker.addListener('click', function() {
				self.showInfo();
			});
		} else {
			alert('Geocode was no successful for the following reason: ' + status);
		}
	})
	// Display rating and review in info window
	this.showInfo = function() {
		var content = '<div class="rating">';
		for (var i = 0; i < this.rating; i++) {
			content += '<img class="star" src="images/star.ico">'
		};
		content += '</div><div class="review">' + this.review + '</div>'
		infoWindow.setContent(content);
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		infoWindow.open(map, self.marker);
		setTimeout(function() {
			self.marker.setAnimation(null);
		}, 700);
	};
};

// ViewModel for the application
var ViewModel = function() {
	// error handling
	if (typeof google !== 'object' || typeof google.maps !== 'object') {
		console.log("error loading Google Maps API");
		googleMapError();
	}
	var self = this;
	this.query = ko.observable('');
	this.locationList = ko.observableArray([]);
	initialLocations.forEach(function(locationItem) {
		self.locationList.push(new Location(locationItem));
	});
	// Run the marker's showInfo function if list item clicked
	this.showInfo = function() {
		this.showInfo();
	};
	this.search = function(value) {
		// only locations that match search criteria should be visible
		self.locationList().forEach(function(location) {
			if(location.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				location.marker.setVisible(true);
				location.visible(true);
			}
			else {
				location.marker.setVisible(false);
				location.visible(false);
			}
		});
	};
	// subscribe to updates to search
	this.query.subscribe(this.search);
};
