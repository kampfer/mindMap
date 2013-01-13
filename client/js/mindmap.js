kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');

kampfer.provide('mindMap');
kampfer.provide('mindMap.init');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');


kampfer.mindMap.init = function() {
	kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');
	kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');
};