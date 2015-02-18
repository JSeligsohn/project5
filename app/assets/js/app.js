function viewModel() {
	var self = this;
	var map;
	var infoWindow;
	self.geolocation = ko.observable();
	var geocoder = new google.maps.Geocoder();
	var newYork = new google.maps.LatLng(40.7776432, -73.9571934);
	self.location = ko.observable('New York');
  	self.markers = ko.observableArray([]);
  	self.currentPlace = ko.observable();

  	/*Set map to searched location 
  	  @param loc is search string, which is converted into Lat-Long 
  	  using Google's Geocoder
  	  Returns a location that is used to create a new map marker if successful;
  	  otherwise alerts and prints an error to the console.
  	*/
  	self.geoCodeMaker = function(loc) {
		geocoder.geocode( { 'address': loc}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {
	    		self.geolocation(results[0].geometry.location);
	        	map.setCenter(self.geolocation());
	        	var marker = new google.maps.Marker({
	            	map: map,
	            	position: self.geolocation()
	        	});
	        	
	      	} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
	      		console.log("Zero results were found. Try searching for a different location.");
	      		alert("Zero results were found. Try searching for a different location.");
	      	}
	      	else {
	        	console.log("Geocode was not successful for the following reason: " + status);
	        	alert("Geocode was not successful for the following reason: " + status);
	      	}
	    });
  	};

  	// Options for Google Map
  	self.mapOptions = ko.computed(function(){
  		return{
    		zoom: 13,
    		disableDefaultUI: true,
    		center: newYork,
    		draggable: true
    	};
  	});

  	// Function to search for place and nearby parks
  	// @param searchPlace is place to search for nearby parks
  	self.request = function(searchPlace){
  		return {
			location: searchPlace,
			radius: 10000,
			query: 'park',
			type: ['park']
		};
	};

	/*
	  For each marker in self.markers, 
	  place it on map, and add a click event listener that:
	    sets self.currentPlace() to that marker,
	    gets photos from Flickr,
	    highlights the place on the listview and shows its infoWindow,
	    and the marker begins to bounce.
	*/
	self.setMarkers = function() {
		for (var i = 0; i < self.markers().length; i++) {
			var mark = self.markers()[i];
			mark.setMap(map);
			mark.setAnimation(null);
			google.maps.event.addListener(mark, 'click', function() {
				self.currentPlace(null);
				self.currentPlace(this);
				this.getPhotos();
				this.highlightPlace();
				this.toggleBounce();
			});
		}
	};

	/*
	  Sets the map to initial place - defaults to New York,
	  and searches for nearby parks.
	*/
	function initialize() {
		infoWindow = new google.maps.InfoWindow();
		map = new google.maps.Map(document.getElementById('map-canvas'), self.mapOptions());
		searchNeighborhood(newYork);
  	};

  	//Look for places of interest in the given neighborhood
  	//using Google Maps' PlacesService
  	function searchNeighborhood(neighborhood) {
  		if (neighborhood) {
  			var service = new google.maps.places.PlacesService(map);
			console.log('Searching for neighborhood...');
			service.textSearch(self.request(neighborhood), searchCallback);
  		}
  	};

  	/*
  	  Callback for searchNeighborhood()
  	  If successful, sets map with markers for places of interest
  	  If fails, alerts and logs to console an appropriate error message.
  	*/
  	function searchCallback(results, status) {
  		if (status == google.maps.places.PlacesServiceStatus.OK) {
  			console.log('Successfully located places.');
  			self.markers.removeAll();
  			console.log('removed markers');
    		for (var i = 0; i < results.length; i++) {
    			newPlace = results[i];
      			self.markers.push(new marker(newPlace.geometry.location, newPlace.name, newPlace.formatted_address));
    		}
    		self.setMarkers();
  		}
  		else {
  			console.log("Searching for places was not successful for the following reason: " + status);
  			alert("Searching for places was not successful for the following reason: " + status);
  		}
  	}

  	//Holds name of the current place whose photos are being shown
  	self.currentPhoto = ko.observable({name: 'Nowhere'});

 	//Stores the photos to show; default is a placeholder photo
  	self.photos = ko.observableArray([new flickrPhoto('images/photo-holder.png')]);

  	//Fired when search bar is submitted. Goes to new neighborhood and updates map.
  	self.submitForm = function() {
  		console.log('Searching...');
  		loc = self.location();
  		console.log(loc);
  		self.geoCodeMaker(loc);
  		//Wait for geoCodeMaker to finish before searching for places of interest
  		setTimeout(function() {
  			searchNeighborhood(self.geolocation());
  		}, 500);
  	};

  	/*
  	  Creates and returns a new map marker with given position, title, and address.
  	  Additional functions are described below.
  	*/
	function marker(pos, title, address) {
		var myLatlng = pos;
		console.log(myLatlng);
		var place = new google.maps.Marker({
		  position: myLatlng,
		  title: title,
		  icon: "images/tree.png",
		  hasPhotos: ko.observable()
		});
		place.address = address;
		//Get flickr photos from feed based on title of marker using AJAX
		place.getPhotos = function() { 		
		// Jump to marker with title
	  		var tag = title;
	  		self.currentPhoto({name: tag}); //update the photo list title
			$.ajax({
				url: "https://api.flickr.com/services/feeds/photos_public.gne" + "?jsoncallback=?&format=json&tags=" + tag,
				dataType: "jsonp",
				success: jsonFlickrFeed,
				timeout: 2000, //Because we're making a JSONP call we can't do normal error handling so we use a timeout instead
				error: function (jqXHR, textStatus, errorThrown){
    				if(textStatus === "timeout") {
    					self.photos.removeAll(); //Remove photos from feed and place image holder for no photos
    					self.photos.push(new flickrPhoto('images/photo-holder.png'));
        				console.log("Could not connect to Flickr API. Your internet may be disconnected or it took too long for a response.");
    				}
				}
			});

		};
		//When click on place, highlights it on map and shows infoWindow
		place.highlightPlace = function() {
			console.log(this.position);
	  		// map.panTo(this.position);
			infoWindow.setContent("<div class='infoWindow'><h5>" + this.title + "</h5><p>" + this.address + "</p></div>");
			infoWindow.open(map, this);
  		}
  		//Success function for flickr feed ajax request.
  		//Returns a set of photo links to populate photo listview or error message if no photos found.
		jsonFlickrFeed = function (data) {
			var photos = data.items; //returns json feed of photos
			var photoLinks = [];
			for (var i = 0; i < photos.length; i++) {
				photoLinks.push(photos[i].media.m); //get just the links from all photos
			}
			console.log(photoLinks);
			self.photos.removeAll(); //Clears the current photo list before populating with new photos
			if (photoLinks.length == 0) {
				self.photos.push(new flickrPhoto('images/photo-holder.png'));
				console.log('No photos were found for the selected location.')
			}
			else {
				for (var link in photoLinks) {
					self.photos.push(new flickrPhoto(photoLinks[link]));
				}
			}
		}
		//Animate the marker when clicked or stop if currently animated
		place.toggleBounce = function() {
			for (var i = 0; i < self.markers().length; i++) {
				var mark = self.markers()[i];
		  		if (mark.getAnimation() != null) {
		  			//Stop animating previously selected marker
		    		mark.setAnimation(null);
		  		}
		  	}
		  	this.setAnimation(google.maps.Animation.BOUNCE);
		}
		return place;
	}

	google.maps.event.addDomListener(window, 'load', initialize());

};

//Sets up our ViewModel using Knockout.js
$(function() {
	vm = new viewModel();
	ko.applyBindings(vm);
});

//Holds information about photos
function flickrPhoto(link) {
	return {
		url: link
	};
}

/** Front-end Design Code **/

//Toggle list view roll-up
function roll_up() {
	$('.list-view ul').toggleClass('rolled-up', 400, "easeInOutSine");
	$('#js-roll-up span').toggleClass('glyphicon-triangle-top').toggleClass('glyphicon-triangle-bottom');
}

//Call roll-up for list-view when triangle is clicked
$('#js-roll-up').click(function() {
	roll_up();
});

//Toggle photo viewer visible
$('#js-photo-roll').click(function() {
	$('.photo-view').toggleClass('photos-visible', 400, "easeInOutSine");
})

//At smaller viewports, automatically roll-up list-view
$(document).ready(function() {
	console.log($(window).width());
	if ($(window).width() < 950) {
		roll_up();
	}
});

//Clicking anywhere on searchbar allows user to enter search term
$('#js-search-bar').click(function() {
	$('#js-search-bar input').focus();
});


