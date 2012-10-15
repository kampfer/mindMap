/*global kampfer,console*/
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMpa.Map');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapController');
kampfer.require('mindMap.command');
kampfer.require('mindMap.Menu');

kampfer.provide('mindMap.app');

(function(kampfer) {
	
	//localstorage
	var localManager = new kampfer.mindMap.MapsManager();
	var data = localManager.getCurMap();

	//map model
	var manager = new kampfer.mindMap.MapManager(data);
	//map view
	var map = new kampfer.mindMap.Map(manager);
	//map controller
	var controller = new kampfer.mindMap.MapController(map);

	//map menu view init
	var mapMenu = new kampfer.mindMap.Menu();
	mapMenu.addItem( new kampfer.mindMap.MenuItem('create node') );
	mapMenu.addItem( new kampfer.mindMap.MenuItem('save') );
	mapMenu.addItem( new kampfer.mindMap.MenuItem('redo') );
	mapMenu.addItem( new kampfer.mindMap.MenuItem('undo') );

	//node menu view init
	var nodeMenu = new kampfer.mindMap.Menu();
	nodeMenu.addItem( new kampfer.mindMap.MenuItem('create child') );
	nodeMenu.addItem( new kampfer.mindMap.MenuItem('edit text') );
	nodeMenu.addItem( new kampfer.mindMap.MenuItem('delete') );

	document.title = manager.getMapName();
	
})(kampfer);