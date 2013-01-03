kampfer.require('Menu');

kampfer.provide('mindMap');
kampfer.provide('mindMap.contextMenu');
kampfer.provide('mindMap.navBar');

kampfer.mindMap.contextMenu = new kampfer.Menu('menu');

kampfer.mindMap.navBar = new kampfer.Menu('nav-bar');

kampfer.mindMap.init = function() {
    kampfer.mindMap.navBar.setPosition(10, 10);
    kampfer.mindMap.navBar.show();

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
    });
};