kampfer.require('Menu');

kampfer.provide('mindMap');
kampfer.provide('mindMap.contextMenu');
kampfer.provide('mindMap.fileMenu');
kampfer.provide('mindMap.editMenu');


kampfer.mindMap.contextMenu = new kampfer.Menu('context-menu');

kampfer.mindMap.fileMenu = new kampfer.Menu('file-menu');

kampfer.mindMap.editMenu = new kampfer.Menu('edit-menu');

kampfer.mindMap.init = function() {
    var mapContainer = document.getElementById('map-container'),
        fileBtn = document.getElementById('file'),
        editBtn = document.getElementById('edit'),
        helpBtn = document.getElementById('help');

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
    /*
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
    */
};