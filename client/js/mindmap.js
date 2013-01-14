kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');

kampfer.provide('mindMap');
kampfer.provide('mindMap.init');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');


kampfer.mindMap.init = function() {
	var window = new kampfer.mindMap.Window('map-container'),
		nodeContextMenu = new kampfer.Menu( document.getElementById('node-context-menu') ),
		contextMenu = new kampfer.Menu(document.getElementById('context-menu'));

	kampfer.mindMap.command.controller = new kampfer.mindMap.command.Controller(
		window, nodeContextMenu, contextMenu);
};