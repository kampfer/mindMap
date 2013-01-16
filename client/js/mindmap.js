kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');
kampfer.require('mindMap.command.Controller');
kampfer.require('events');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.tooBar');
kampfer.provide('mindMap.nodeContextMenu');
kampfer.provide('mindmPa.contextMenu');

kampfer.mindMap.init = function() {
    var nodeContextMenu = document.getElementById('node-context-menu'),
        contextMenu = document.getElementById('context-menu');

    kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');
    kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');
    kampfer.mindMap.nodeContextMenu = new kampfer.Menu(nodeContextMenu);
    kampfer.mindMap.contextMenu = new kampfer.Menu(contextMenu);

    kampfer.mindMap.command.controller = new kampfer.mindMap.command.Controller();

    kampfer.events.addListener( kampfer.mindMap.window.getElement(), 'contextmenu', function(event) {
        var role = event.target.getAttribute('role'),
            scrollX = kampfer.mindMap.window.scrollLeft(),
            scrollY = kampfer.mindMap.window.scrollTop();

        var menu;
        if(role === 'caption' || role === 'node') {
            menu = kampfer.mindMap.nodeContextMenu;
        } else if(role === 'map') {
            menu = kampfer.mindMap.contextMenu;
        }

        if(menu) {
            menu.setPosition(event.pageX + scrollX, event.pageY + scrollY);
            menu.show();
        }

        return false;
    });

    kampfer.events.addListener( kampfer.mindMap.window.getElement(), 'click', function() {
        kampfer.mindMap.contextMenu.hide();
        kampfer.mindMap.nodeContextMenu.hide();
    });
};