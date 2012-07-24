/*global kampfer*/
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {

	var defaultMap = {
		nodes : {
			root : {
				id : 'root',
				parent : '',
				children : [],
				content : 'root',
				offset : {
					x : '1000',
					y : '1000'
				},
				style : 'root'
			}
		},
		config : {}
	};
	
	var data;
	if(localStorage && localStorage.aMap) {
		data = JSON.parse(localStorage.aMap);
	} else {
		data = defaultMap;
	}
	
	var manager = new kampfer.mindMap.MapManager(data);
	var controller = new kampfer.mindMap.MapController(manager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
