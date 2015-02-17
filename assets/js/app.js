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

  	// Set map to searched location 
  	// @param loc is search string, which is converted into Lat-Long
  	self.geoCodeMaker = function(loc) {
		geocoder.geocode( { 'address': loc}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {
	    		self.geolocation(results[0].geometry.location);
	        	map.setCenter(self.geolocation());
	        	var marker = new google.maps.Marker({
	            	map: map,
	            	position: self.geolocation()
	        	});
	        	
	      	} else {
	        	alert("Geocode was not successful for the following reason: " + status);
	      	}
	    });
		// return self.geolocation();
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
  	self.request = function(searchPlace){
  		return {
			location: searchPlace,
			radius: 10000,
			query: 'park',
			type: ['park']
		};
	};

	// For each marker, place it on map and retrieve photos from Flickr feed.
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
				//When clicking on marker, roll-up the listview if it's open
				// conditional_roll_up();
			});
		}
	};



	//Gets the map started with places - defaults to New York
	function initialize() {

		infoWindow = new google.maps.InfoWindow();
		map = new google.maps.Map(document.getElementById('map-canvas'), self.mapOptions());
		searchNeighborhood(newYork);
		// self.photos.push['assets/images/photo-holder.png'];

  	};

  	//Look for places of interest in the given neighborhood
  	function searchNeighborhood(neighborhood) {
  		var service = new google.maps.places.PlacesService(map);
		// self.setMarkers();
		console.log('Searching for neighborhood');
		service.textSearch(self.request(neighborhood), searchCallback);
  	};

  	//Holds name of the current place who's photos are being shown
  	self.currentPhoto = ko.observable({name: 'Nowhere'});

 	// Stores the photos to show; default is a placeholder photo
  	self.photos = ko.observableArray([new flickrPhoto('assets/images/photo-holder.png')]);

  	//Fired when search bar is submitted. Goes to new neighborhood and updates map.
  	self.submitForm = function() {
  		console.log('Searched!');
  		loc = self.location();
  		console.log(loc);
  		self.geoCodeMaker(loc);
  		setTimeout(function() {
  			searchNeighborhood(self.geolocation());
  		}, 500);
  	};

  	//Callback for neighborhood search
  	function searchCallback(results, status) {
  		if (status == google.maps.places.PlacesServiceStatus.OK) {
  			console.log('yeah!!');
  			self.markers.removeAll();
  			console.log('removed markers');
    		for (var i = 0; i < results.length; i++) {
    			newPlace = results[i];
    			console.log(newPlace);
      			self.markers.push(new marker(newPlace.geometry.location, newPlace.name, newPlace.formatted_address));
    		}
    		self.setMarkers();
  		}
  	}

  	//Creates a new map marker with given position
	function marker(pos, title, address) {
		var myLatlng = pos;
		console.log(myLatlng);
		var place = new google.maps.Marker({
		  position: myLatlng,
		  title: title,
		  icon: "assets/images/tree.png",
		  hasPhotos: ko.observable()
		});
		place.address = address;
		//Get flickr photos from feed based on title of marker
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
    					self.photos.push(new flickrPhoto('assets/images/photo-holder.png'));
        				console.log("Could not connect to Flickr API");
    				}
				}
			});

		};
		place.output = function() {
			console.log("Has Photos?" + place.hasPhotos());
		}
		//When click on place, highlights it on map and shows infoWindow
		place.highlightPlace = function() {
			console.log(this.position);
	  		map.panTo(this.position);
			infoWindow.setContent("<div class='infoWindow'><h5>" + this.title + "</h5><p>" + this.address + "</p></div>");
			infoWindow.open(map, this);
  		}
  		// place.getPhotos();
  		// setTimeout(function() {console.log(place.hasPhotos)}, 100);
  		console.log(place.hasPhotos());
  		//success function for flickr feed ajax request
		jsonFlickrFeed = function (data) {
			var photos = data.items; //returns json feed of photos
			if (data.items.length > 0) {
				place.hasPhotos(true);
			}
			else {
				place.hasPhotos(false);
			}
			console.log("Do we have?" + place.hasPhotos());
			console.log(photos);
			var photoLinks = [];
			for (var i = 0; i < photos.length; i++) {
				photoLinks.push(photos[i].media.m); //get just the links from all photos
			}
			console.log(photoLinks);
			self.photos.removeAll();
			if (photoLinks.length == 0) {
				self.photos.push(new flickrPhoto('assets/images/photo-holder.png'));
				place.hasPhotos(false);
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

//Conditional roll-up for when it's rolled-down 
// function conditional_roll_up() {
// 	if (!$('.list-view ul').hasClass('rolled-up')) {
// 		roll_up();
// 	}
// }

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

$('#js-search-bar').click(function() {
	$('#js-search-bar input').focus();
});


