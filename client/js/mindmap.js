kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');
kampfer.require('mindMap.Menu');
kampfer.require('mindMap.command.Controller');
kampfer.require('events');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');
kampfer.provide('mindMap.nodeContextMenu');
kampfer.provide('mindMap.contextMenu');

kampfer.mindMap.init = function() {
    var nodeContextMenu = document.getElementById('node-context-menu'),
        contextMenu = document.getElementById('context-menu');

    kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');
    kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');
    kampfer.mindMap.nodeContextMenu = new kampfer.Menu(nodeContextMenu);
    kampfer.mindMap.contextMenu = new kampfer.Menu(contextMenu);

    kampfer.mindMap.command.controller = new kampfer.mindMap.command.Controller(window);

    kampfer.mindMap.toolBar.eachChild(function(child) {
        child.addListener('beforemenushow', function() {
            var commands = this.getElement().querySelectorAll('[command]');
            console.log(commands.length);
            for(var i = 0, command; (command = commands[i]); i++) {
                var name = command.getAttribute('command');
                command = kampfer.mindMap.command.controller.getCommand(name);
                if( command.isAvailable && !command.isAvailable() ) {
                    this.disable(i);
                } else {
                    this.enable(i);
                }
            }
        });
    });
};