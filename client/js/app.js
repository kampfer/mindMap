kampfer.require('mindMap.Window');
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.command');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');


kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');

//kampfer.mindMap.toolBar = new kampfer.mindMap.toolBar('tool-bar');

//kampfer.mindMap.commandController = new kampfer.mindMap.commandController();

kampfer.mindMap.init = function() {
    //kampfer.mindMap.commandController.subscrible(kampfer.mindMap.window);
};