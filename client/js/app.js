/*global window,kampfer,console,localStorage*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	var mapName = 'test';
	var localManager = new kampfer.mindMap.MapsManager(mapName);
	var data = localManager.getCurMap();
	data = data ? data : mapName;
	var manager = new kampfer.mindMap.MapManager(data);
	document.title = manager.getMapName();
	var controller = new kampfer.mindMap.MapController(manager, localManager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
