kampfer.require('Menu');

kampfer.provide('mindMap');
kampfer.provide('mindMap.contextMenu');
kampfer.provide('mindMap.fileMenu');
kampfer.provide('mindMap.editMenu');


kampfer.mindMap.contextMenu = new kampfer.Menu('context-menu');

kampfer.mindMap.fileMenu = new kampfer.Menu('file-menu');

kampfer.mindMap.editMenu = new kampfer.Menu('edit-menu');

kampfer.mindMap.init = function() {
    var mapContainer = document.getElementById('map-container');

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
    })
};