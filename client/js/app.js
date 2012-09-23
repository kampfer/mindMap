/*global window kampfer console localStorage*/
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	var manager = new kampfer.mindMap.MapManager();
	var controller = new kampfer.mindMap.MapController(manager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
