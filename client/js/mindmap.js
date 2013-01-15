kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');
kampfer.require('mindMap.command.Controller');

kampfer.provide('mindMap');

kampfer.mindMap.init = function() {
	var window = new kampfer.mindMap.Window('map-container'),
		nodeContextMenu = new kampfer.Menu( document.getElementById('node-context-menu') ),
		contextMenu = new kampfer.Menu(document.getElementById('context-menu'));

	kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');

	kampfer.mindMap.command.controller = new kampfer.mindMap.command.Controller(
		window, nodeContextMenu, contextMenu);
};