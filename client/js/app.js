kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');
kampfer.require('mindMap.CommandController');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');


kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');

kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');

kampfer.mindMap.commandController = new kampfer.mindMap.CommandController();

kampfer.mindMap.currentMap = null;

kampfer.mindMap.currentNode = [];

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

    var demo = {
        "document" : [
            {
                "id" : "child1",
                "content" : "child1",
                "offset" : {"x" : 100, "y" : 200},
                "parent" : null,
                "children" : [
                    {
                        "id" : "child1-1",
                        "content" : "child1-1",
                        "offset" : {"x" : 100, "y" : 200},
                        "parent" : "child1",
                        "children" : [
                            {
                                "id" : "child1-1-1",
                                "content" : "child1-1-1",
                                "offset" : {"x" : 200, "y" : 200},
                                "parent" : "child1-1",
                                "children" : null
                            }
                        ]
                    },
                    {
                        "id" : "child1-2",
                        "content" : "child1-2",
                        "offset" : {"x" : 200, "y" : 200},
                        "parent" : "child1",
                        "children" : null
                    }
                ]
            },
            {
                "id" : "child2",
                "content" : "child2",
                "offset" : {"x" : 100, "y" : 100},
                "parent" : null,
                "children" : null
            },
            {
                "id" : "child3",
                "content" : "child3",
                "offset" : {"x" : 200, "y" : 100},
                "parent" : null,
                "children" : null
            }
        ],
        "name" : "untitled",
        "lastModified" : 123456789
    };

    var demoMap = new kampfer.mindMap.MapManager(demo);
    var map = new kampfer.mindMap.Map(demoMap);
    var mapContainer = document.getElementById('mapContainer');
    map.render(mapContainer);
};