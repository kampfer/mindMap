/*global window,kampfer,console,localStorage*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMpa.Map');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');
kampfer.require('mindMap.command');
kampfer.require('mindMap.menu');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	var mapName = 'test';
	var localManager = new kampfer.mindMap.MapsManager(mapName);
	var data = localManager.getCurMap();
	data = data ? data : mapName;
	//TODO mapManager应该有一个默认名字
	var manager = new kampfer.mindMap.MapManager(data);
	document.title = manager.getMapName();
	var controller = new kampfer.mindMap.MapController(manager, localManager);
	controller.render();
	controller.monitorEvents();
	
})(kampfer);
