/*global kampfer*/
kampfer.require('mindMap.mapController');

(function(kampfer) {
	
	var mapContainer = document.getElementById('mapContainer');
	
	var map = new kampfer.mindMap.mapController(mapContainer);
	
})(kampfer);
