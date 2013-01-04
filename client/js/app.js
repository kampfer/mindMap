kampfer.require('Menu');
kampfer.require('mindMap.MapsManager');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.command');

kampfer.provide('mindMap');
kampfer.provide('mindMap.contextMenu');
kampfer.provide('mindMap.fileMenu');
kampfer.provide('mindMap.editMenu');
kampfer.provide('mindMap.currentMap');


kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');

kampfer.mindMap.toolBar = new kampfer.mindMap.toolBar('tool-bar');

kampfer.mindMap.commandController = new kampfer.mindMap.commandController();

kampfer.mindMap.init = function() {
    var mapContainer = document.getElementById('map-container'),
        fileBtn = document.getElementById('file'),
        editBtn = document.getElementById('edit'),
        helpBtn = document.getElementById('help');

    //windowController
	kampfer.events.addListener(mapContainer, 'contextmenu', function(event) {
        kampfer.mindMap.contextMenu.setPosition(event.pageX, event.pageY);
        kampfer.mindMap.contextMenu.show();
        return false;
    });

    kampfer.events.addListener(mapContainer, 'click', function(event) {
        if(event.which === 1) {
            kampfer.mindMap.contextMenu.hide();
            return false;
        }
    });

    //toolbarController
    kampfer.events.addListener(fileBtn, 'mouseover', function() {
        kampfer.mindMap.fileMenu.show();
    });

    kampfer.events.addListener(fileBtn, 'mouseout', function() {
        kampfer.mindMap.fileMenu.hide();
    });

    kampfer.events.addListener(editBtn, 'mouseover', function() {
        kampfer.mindMap.editMenu.show();
    });

    kampfer.events.addListener(editBtn, 'mouseout', function() {
        kampfer.mindMap.editMenu.hide();
    });

    //commandController
    kampfer.events.addListener(kampfer.mindMap.fileMenu, 'newFile',
        kampfer.mindMap.command.createNewMap);

    kampfer.events.addListener(kampfer.mindMap.fileMenu, 'openFileInStorage',
        kampfer.mindMap.command.openFileInStorage);

    kampfer.events.addListener(kampfer.mindMap.fileMenu, 'openFileInDisk',
        kampfer.mindMap.command.openFileInDisk);

    kampfer.events.addListener(kampfer.mindMap.fileMenu, 'saveFileInStorage',
        kampfer.mindMap.command.saveFileInStorage);

    kampfer.events.addListener(kampfer.mindMap.fileMenu, 'saveFileInDisk',
        kampfer.mindMap.command.saveFileInDisk);

    kampfer.events.addListener(kampfer.mindMap.editMenu, 'copy',
        kampfer.mindMap.command.copy);

    kampfer.events.addListener(kampfer.mindMap.editMenu, 'cut',
        kampfer.mindMap.command.cut);

    kampfer.events.addListener(kampfer.mindMap.editMenu, 'paste',
        kampfer.mindMap.command.paste);

    kampfer.events.addListener(kampfer.mindMap.editMenu, 'undo',
        kampfer.mindMap.command.undo);

    kampfer.events.addListener(kampfer.mindMap.editMenu, 'redo',
        kampfer.mindMap.command.redo);

    kampfer.events.addListener(kampfer.mindMap.contextMenu, 'copy',
        kampfer.mindMap.command.copy);

    kampfer.events.addListener(kampfer.mindMap.contextMenu, 'cut',
        kampfer.mindMap.command.cut);

    kampfer.events.addListener(kampfer.mindMap.contextMenu, 'paste',
        kampfer.mindMap.command.paste);

    kampfer.events.addListener(kampfer.mindMap.contextMenu, 'undo',
        kampfer.mindMap.command.undo);

    kampfer.events.addListener(kampfer.mindMap.contextMenu, 'redo',
        kampfer.mindMap.command.redo);
};