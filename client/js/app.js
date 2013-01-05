kampfer.require('mindMap.Window');
kampfer.require('mindMap.ToolBar');

kampfer.provide('mindMap');
kampfer.provide('mindMap.window');
kampfer.provide('mindMap.toolBar');


kampfer.mindMap.window = new kampfer.mindMap.Window('map-container');

kampfer.mindMap.toolBar = new kampfer.mindMap.ToolBar('app-tool-bar');
kampfer.mindMap.toolBar.addMenu('file');
kampfer.mindMap.toolBar.addMenu('edit');

kampfer.mindMap.init = function() {
    console.log( kampfer.mindMap.toolBar.getMenu('file') );
    console.log( kampfer.mindMap.toolBar.hasOwnProperty('getChild') );
    console.log( 'getChild' in kampfer.mindMap.toolBar);
    console.log( kampfer.mindMap.toolBar.hasOwnProperty('dispatch') );
    console.log( 'dispatch' in kampfer.mindMap.toolBar);
    console.log( kampfer.mindMap.toolBar.hasOwnProperty('render') );
    console.log( 'render' in kampfer.mindMap.toolBar);
};