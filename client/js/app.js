/*global window,kampfer,console,localStorage*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');

kampfer.provide('mindMap.app');

(function(kampfer) {

	function $(id) {
		return document.getElementById(id);
	}
	
	var localManager = new kampfer.mindMap.MapsManager('mindMap');

	kampfer.events.addEvent($('createNewMap'), 'click', function() {
		var mapName = prompt('请输入map的名字');
		if(!mapName) {
			alert('map名不能为空！');
			return;
		}

		var data = localManager.getMapData(mapName);

		if(!data) {
			data = mapName;
		}
		var manager = new kampfer.mindMap.MapManager(data, localManager);

		document.title = manager.getMapName();

		var controller = new kampfer.mindMap.MapController(manager, localManager);
		controller.render();
		controller.monitorEvents();
	});

	kampfer.events.addEvent($('openMapInBroswer'), 'click', function() {
		alert('未完成！');
	});

	kampfer.events.addEvent($('openMapInJson'), 'click', function() {
		alert('未完成！');
	});

})(kampfer);
