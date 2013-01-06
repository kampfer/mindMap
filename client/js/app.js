kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');


kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');

kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');

kampfer.mindMap.commandController = new kampfer.mindMap.CommandController();

kampfer.mindMap.init = function() {
    var fileMenu = document.getElementById('file-menu'),
        editMenu = document.getElementById('edit-menu'),
        fileMenuTrigger = document.getElementById('file-menu-trigger'),
        editMenuTrigger = document.getElementById('edit-menu-trigger');

    kampfer.mindMap.toolBar.addMenu(fileMenu, fileMenuTrigger);
    kampfer.mindMap.toolBar.addMenu(editMenu, editMenuTrigger);

    kampfer.mindMap.toolBar.eachChild(function(child) {
        var role = child._element.getAttribute('role');
        if(role && role === 'menu') {
            kampfer.mindMap.commandController.subscrible(child);
        }
    });
};

kampfer.mindMap.parse = function() {

};