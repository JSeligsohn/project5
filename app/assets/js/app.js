
// function friend(name) {
// 	return {
// 		name: ko.observable(name),
// 		isOnTwitter: ko.observable(false),
// 		twitterName: ko.observable(),
// 		remove: function() {
// 			viewModel.friends.remove(this);
// 		}
// 	};
// }

// var viewModel = {
// 	firstName: ko.observable("Bert"),
// 	lastName: ko.observable("Simmons"),
// 	friends: ko.observableArray([new friend("Steve"), new friend("Max")]),
// 	addFriend: function() {
// 		this.friends.push(new friend("Another"));
// 	}
// };

// viewModel.fullName = ko.dependentObservable(function() {
// 	return this.firstName() + " " + this.lastName();
// }, viewModel);

// ko.applyBindings(viewModel);



function viewModel() {
	var self = this;
	var map;
	var infoWindow;
	var newYork = new google.maps.LatLng(40.7776432, -73.9571934);
	self.request = {
		location: newYork,
		radius: 10000,
		query: 'park',
		type: ['park']
	};
	self.location = ko.observable(newYork);
	self.mapOptions = {
    	zoom: 13,
    	disableDefaultUI: true,
    	center: newYork
  	};
  	self.markers = ko.observableArray([
		// new marker([40.753596,-73.983233], 'Bryant Park'),
  // 		new marker([40.742037,-73.987564], 'Madison Square Park'),
  // 		new marker([40.782865,-73.965355], 'Central Park')
  	]);
	self.setMarkers = function() {
		for (marker in self.markers()) {
			console.log(marker);
			mark = self.markers()[marker];
			mark.setMap(map);
			google.maps.event.addListener(mark, 'click', function() {
				this.getPhotos();
				this.highlightPlace();
			});
		}
	};
	self.initialize = function() {
		infoWindow = new google.maps.InfoWindow();
		map = new google.maps.Map(document.getElementById('map-canvas'), self.mapOptions);
		var service = new google.maps.places.PlacesService(map);
		// self.setMarkers();
		service.textSearch(self.request, searchCallback);

  	};

  	self.currentPhoto = ko.observable({name: 'Nowhere'});

	// //Get flickr photos from feed based on title of marker
 //  	self.getPhotos = function(place) {
 //  		// Jump to marker with title
 //  		var tag = this.title;
	// 	infoWindow.setContent(tag);
	// 	infoWindow.open(map, this);
 //  		map.panTo(this.position);
 //  		self.currentPhoto({name: tag}); //update the photo list title
	// 	$.ajax({
	// 		url: "https://api.flickr.com/services/feeds/photos_public.gne" + "?format=json&tags=" + tag,
	// 		dataType: "jsonp",
	// 	})
 //  	}

  	self.photos = ko.observableArray();

  	function searchCallback(results, status) {
  		if (status == google.maps.places.PlacesServiceStatus.OK) {
  			console.log('yeah!!');
  			self.markers.removeAll();
    		for (var i = 0; i < results.length; i++) {
    			newPlace = results[i];
    			console.log(newPlace);
      			self.markers.push(new marker(newPlace.geometry.location, newPlace.name));
    		}
    		self.setMarkers();
  		}
  	}

  	//Creates a new map marker with given position
	function marker(pos, title) {
		var myLatlng = pos;
		console.log(myLatlng);
		place = new google.maps.Marker({
		  position: myLatlng,
		  title: title,
		});
		//Get flickr photos from feed based on title of marker
		place.getPhotos = function() { 		
		// Jump to marker with title
	  		var tag = title;
	  		self.currentPhoto({name: tag}); //update the photo list title
			$.ajax({
				url: "https://api.flickr.com/services/feeds/photos_public.gne" + "?format=json&tags=" + tag,
				dataType: "jsonp",
			})
		};
		place.highlightPlace = function() {
	  		map.panTo(this.position);
			infoWindow.setContent(this.title);
			infoWindow.open(map, this);
  		}
		return place;
	}

	google.maps.event.addDomListener(window, 'load', self.initialize);

};


$(function() {
	vm = new viewModel();
	ko.applyBindings(vm);
});

function flickrPhoto(link) {
	return {
		url: link
	};
}

//success function for flickr feed ajax request
function jsonFlickrFeed(data) {
	var photos = data.items; //returns json feed of photos
	console.log(photos);
	var photoLinks = [];
	for (photo in photos) {
		photoLinks.push(photos[photo].media.m); //get just the links from all photos
	}
	console.log(photoLinks);
	vm.photos.removeAll();
	for (var link in photoLinks) {
		vm.photos.push(new flickrPhoto(photoLinks[link]));
	}
}


