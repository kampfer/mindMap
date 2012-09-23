/*global window kampfer console localStorage*/
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	var mapName = 'test';
	var manager = new kampfer.mindMap.MapManager(mapName);
	document.title = manager.getMapName();
	var controller = new kampfer.mindMap.MapController(manager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
