function viewModel(){function initialize(){geocoder=new google.maps.Geocoder,self.newYork(new google.maps.LatLng(40.7776432,-73.9571934)),infoWindow=new google.maps.InfoWindow,map=new google.maps.Map(document.getElementById("map-canvas"),self.mapOptions()),searchNeighborhood(self.newYork())}function searchNeighborhood(neighborhood){if(neighborhood){var service=new google.maps.places.PlacesService(map);console.log("Searching for neighborhood..."),service.textSearch(self.request(neighborhood),searchCallback)}}function searchCallback(results,status){if(status==google.maps.places.PlacesServiceStatus.OK){console.log("Successfully located places."),self.markers.removeAll();for(var i=0;i<results.length;i++)newPlace=results[i],self.markers.push(new marker(newPlace.geometry.location,newPlace.name,newPlace.formatted_address));self.setMarkers()}else console.log("Searching for places was not successful for the following reason: "+status),alert("Searching for places was not successful for the following reason: "+status)}function marker(pos,title,address){var myLatlng=pos,place=new google.maps.Marker({position:myLatlng,title:title,icon:"images/tree.png",hasPhotos:ko.observable()});return place.address=address,place.getPhotos=function(){var tag=title;self.currentPhoto({name:tag}),$.ajax({url:"https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?&format=json&tags="+tag,dataType:"jsonp",success:jsonFlickrFeed,timeout:2e3,error:function(jqXHR,textStatus){"timeout"===textStatus&&(self.photos.removeAll(),self.photos.push(new flickrPhoto("images/photo-holder.png")),console.log("Could not connect to Flickr API. Your internet may be disconnected or it took too long for a response."))}})},place.highlightPlace=function(){console.log(this.position),infoWindow.setContent("<div class='infoWindow'><h5>"+this.title+"</h5><p>"+this.address+"</p></div>"),infoWindow.open(map,this)},jsonFlickrFeed=function(data){for(var photos=data.items,photoLinks=[],i=0;i<photos.length;i++)photoLinks.push(photos[i].media.m);if(console.log(photoLinks),self.photos.removeAll(),0===photoLinks.length)self.photos.push(new flickrPhoto("images/photo-holder.png")),console.log("No photos were found for the selected location.");else for(var link in photoLinks)self.photos.push(new flickrPhoto(photoLinks[link]))},place.toggleBounce=function(){for(var i=0;i<self.markers().length;i++){var mark=self.markers()[i];null!==mark.getAnimation()&&mark.setAnimation(null)}this.setAnimation(google.maps.Animation.BOUNCE)},place}var map,infoWindow,geocoder,self=this;self.newYork=ko.observable(),self.googleMapsWorking=ko.observable(),"undefined"==typeof google?(self.googleMapsWorking(!1),console.log("Unable to reach Google Maps API. Try again later.")):(console.log("Successfuly connected to Google Maps API."),self.googleMapsWorking(!0)),self.geolocation=ko.observable(!1),self.location=ko.observable("New York"),self.markers=ko.observableArray([]),self.currentPlace=ko.observable(),self.geoCodeMaker=function(loc){geocoder.geocode({address:loc},function(results,status){status==google.maps.GeocoderStatus.OK?(console.log(results),self.geolocation(results[0].geometry.location),map.setCenter(self.geolocation()),self.location(results[0].formatted_address)):status==google.maps.GeocoderStatus.ZERO_RESULTS?(console.log("Zero results were found. Try searching for a different location."),alert("Zero results were found. Try searching for a different location.")):(console.log("Geocode was not successful for the following reason: "+status),alert("Geocode was not successful for the following reason: "+status))})},self.mapOptions=ko.computed(function(){return{zoom:13,disableDefaultUI:!0,center:self.newYork(),draggable:!0}}),self.request=function(searchPlace){return{location:searchPlace,radius:1e4,query:"park",type:["park"]}},self.setMarkers=function(){for(var i=0;i<self.markers().length;i++){var mark=self.markers()[i];mark.setMap(map),mark.setAnimation(null),google.maps.event.addListener(mark,"click",function(){self.currentPlace(null),self.currentPlace(this),this.getPhotos(),this.highlightPlace(),this.toggleBounce()})}},self.currentPhoto=ko.observable({name:"Nowhere"}),self.photos=ko.observableArray([new flickrPhoto("images/photo-holder.png")]),self.submitForm=function(){console.log("Searching..."),loc=self.location(),console.log(loc),self.geoCodeMaker(loc),setTimeout(function(){searchNeighborhood(self.geolocation())},500)},self.googleMapsWorking()&&google.maps.event.addDomListener(window,"load",initialize())}function flickrPhoto(link){return{url:link}}function roll_up(){$(".list-view ul").toggleClass("rolled-up",400,"easeInOutSine"),$("#js-roll-up span").toggleClass("glyphicon-triangle-top").toggleClass("glyphicon-triangle-bottom")}$(function(){vm=new viewModel,ko.applyBindings(vm)}),$("#js-roll-up").click(function(){roll_up()}),$("#js-photo-roll").click(function(){$(".photo-view").toggleClass("photos-visible",400,"easeInOutSine")}),$(document).ready(function(){$(window).width()<950&&roll_up()}),$("#js-search-bar").click(function(){$("#js-search-bar input").focus()});