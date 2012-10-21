/*global window,kampfer,console,localStorage*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	var localManager = new kampfer.mindMap.MapsManager('mindMap');
	var data = localManager.getMapData('test');
	var manager = new kampfer.mindMap.MapManager(data, localManager);
	document.title = manager.getMapName();
	var controller = new kampfer.mindMap.MapController(manager, localManager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
