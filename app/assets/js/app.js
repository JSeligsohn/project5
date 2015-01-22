
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

var viewModel = {
	location: ko.observable("Philadelphia"),
};

viewModel.map = ko.computed(function() {
	return this.src;

}, viewModel);

ko.applyBindings(viewModel);

var map;
function initialize() {
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(40.7776432, -73.9571934)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  var markers = [
  	marker([40.753596,-73.983233], map,'Bryant Park'),
  	marker([40.742037,-73.987564], map, 'Madison Square Park'),
  	marker([40.782865,-73.965355], map, 'Central Park')
  ];
  console.log(markers);
}

//Creates a new map marker with given position
function marker(pos, map, title) {
	var myLatlng = new google.maps.LatLng(pos[0],pos[1]);
	console.log(myLatlng);
	return new google.maps.Marker({
	  position: myLatlng,
	  map: map,
	  title: title
	});
}

google.maps.event.addDomListener(window, 'load', initialize);