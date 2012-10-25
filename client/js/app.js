/*global window,kampfer,console,localStorage*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');
kampfer.require('JSON');

kampfer.provide('mindMap.app');

(function(kampfer) {

	function $(id) {
		return document.getElementById(id);
	}
	
	var localManager = new kampfer.mindMap.MapsManager('mindMap');

	var maping, controller, input = $('mapJson');

	kampfer.events.addEvent($('createNewMap'), 'click', function() {
		var mapName = prompt('请输入map的名字');
		if(mapName === null) {
			return;
		}

		var manager = new kampfer.mindMap.MapManager(mapName, localManager);

		document.title = manager.getMapName();

		controller = new kampfer.mindMap.MapController(manager, localManager);
		controller.render();
		controller.monitorEvents();

		maping = true;
	});

	kampfer.events.addEvent($('openMapInBroswer'), 'click', function() {
		var mapList = localManager.getMapList();
		if(!mapList) {
			alert('浏览器中不存在map');
			return;
		}

		var hint = '请选择map : ' + mapList.join(',');
		var mapName = prompt(hint);
		if(mapName) {
			var data = localManager.getMapData(mapName);
			var manager = new kampfer.mindMap.MapManager(data, localManager);

			document.title = manager.getMapName();

			controller = new kampfer.mindMap.MapController(manager, localManager);
			controller.render();
			controller.monitorEvents();

			maping = true;
		} else if(mapName === '') {
			alert('请输入map名字');
			arguments.callee();
		}
	});

	kampfer.events.addEvent($('openMapInJson'), 'click', function() {
		input.click();
	});

	kampfer.events.addEvent(input, 'change', function(e){
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var files = e.target.files;
			for(var i = 0, f; f = files[i]; i++) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var result = e.target.result;
					var data = kampfer.JSON.parse(result);

					var manager = new kampfer.mindMap.MapManager(data, localManager);
					document.title = manager.getMapName();
					controller = new kampfer.mindMap.MapController(manager, localManager);
					controller.render();
					controller.monitorEvents();
				}
				reader.readAsText(f);
			}
		} else {
			alert('浏览器不支持html5 files api');
		}
	});

	window.onbeforeunload = function(event) {
		if(maping && controller.currentMapManager.isModified() ) {
			event = event || window.event;
			event.returnValue = 'map未保存,确定退出?';
			return 'map未保存,确定退出?';
		}
	};

	//TODO events组件存在缺陷,触发事件时一些浏览器行为无法被触发。
	//jQuery的event组件，会在执行所有保存的事件处理函数后再调用一次dom对应的事件方法来触发浏览器的行为。
	//google closure每次绑定事件时实际都调用了一次addEventListener
	//jQuery和google closure都能正确地触发浏览器的行为。kampfer目前更偏向jquery的方式。
	//kampfer.events.addEvent(window, 'beforeunload', function(event) {
	//	if(maping && controller.currentMapManager.isModified() ) {
	//		event.src.returnValue = '真的离开?';
	//		return '真的离开?';
	//	}
	//});

})(kampfer);
