kampfer.addDependency('base.js', [], []);
kampfer.addDependency('branch.js', ['mindMap.Branch'], ['Component','dom','events']);
kampfer.addDependency('caption.js', ['mindMap.Caption'], ['Component','dom','events']);
kampfer.addDependency('command.js', ['mindMap.command','mindMap.map','mindMap.mapManager','mindMap.mapsManager'], ['Class','JSON','BlobBuilder','saveAs','mindMap.Node','mindMap.Map','mindMap.MapManager','mindMap.MapsManager','mindMap.OpenMapDialog','mindMap.RenameMapDialog']);
kampfer.addDependency('commandcontroller.js', ['mindMap.command.Controller'], ['Class','mindMap.command','mindMap.map','mindMap.mapManager','mindMap.command.stack','mindMap.radio','mousetrap']);
kampfer.addDependency('commandstack.js', ['mindMap.command.stack','mindMap.command.Redo','mindMap.command.Undo'], ['mindMap.command']);
kampfer.addDependency('component.js', ['Component'], ['Composition','dom']);
kampfer.addDependency('composition.js', ['Composition'], ['events.EventTarget']);
kampfer.addDependency('help.js', [], []);
kampfer.addDependency('kampfer/ajax.js', ['ajax'], []);
kampfer.addDependency('kampfer/base.js', [], []);
kampfer.addDependency('kampfer/class/class.js', ['Class'], []);
kampfer.addDependency('kampfer/class/composition.js', ['class.Composition'], ['events.EventTarget']);
kampfer.addDependency('kampfer/class/dialog.js', ['Dialog'], ['class.UIComponent','dom']);
kampfer.addDependency('kampfer/class/eventtarget.js', ['events.EventTarget'], ['events','Class']);
kampfer.addDependency('kampfer/class/uicomponent.js', ['class.UIComponent'], ['class.Composition','events']);
kampfer.addDependency('kampfer/class.js', ['Class'], []);
kampfer.addDependency('kampfer/data.js', ['data'], ['browser.support']);
kampfer.addDependency('kampfer/dom.js', ['dom'], []);
kampfer.addDependency('kampfer/events.js', ['events','events.Event','events.Listener'], ['data']);
kampfer.addDependency('kampfer/eventtarget.js', ['events.EventTarget'], ['events','Class']);
kampfer.addDependency('kampfer/helper/es5-shim.js', [], []);
kampfer.addDependency('kampfer/helper/json2.js', ['JSON'], []);
kampfer.addDependency('kampfer/support.js', ['browser.support'], []);
kampfer.addDependency('map.js', ['mindMap.Map'], ['events','dom','Component','mindMap.Node','mindMap.radio']);
kampfer.addDependency('MapManager.js', ['mindMap.MapManager'], ['Class']);
kampfer.addDependency('MapsManager.js', ['mindMap.MapsManager'], ['Class','store']);
kampfer.addDependency('menu.js', ['Menu','MenuItem'], ['Component','dom','events','mindMap.radio']);
kampfer.addDependency('mindmap.js', ['mindMap','mindMap.window','mindMap.toolBar','mindMap.nodeContextMenu','mindMap.contextMenu'], ['mindMap.Window','mindMap.ToolBar','mindMap.command.Controller','Menu','events']);
kampfer.addDependency('node.js', ['mindMap.Node'], ['events','dom','Component','mindMap.Branch','mindMap.Caption']);
kampfer.addDependency('openmapdialog.js', ['mindMap.OpenMapDialog'], ['Dialog','mindMap.command']);
kampfer.addDependency('plugins/BlobBuilder.min.js', ['BlobBuilder'], []);
kampfer.addDependency('plugins/FileSaver.min.js', ['saveAs'], []);
kampfer.addDependency('plugins/modernizr-latest.js', [], []);
kampfer.addDependency('plugins/mousetrap.min.js', ['mousetrap'], []);
kampfer.addDependency('plugins/store.min.js', ['store'], []);
kampfer.addDependency('radio.js', ['mindMap.radio'], ['events.EventTarget']);
kampfer.addDependency('renamemapdialog.js', ['mindMap.RenameMapDialog'], ['Dialog','mindMap.command']);
kampfer.addDependency('toolbar.js', ['mindMap.ToolBar'], ['Component','events','Menu']);
kampfer.addDependency('window.js', ['mindMap.Window'], ['Component','events','Menu','dom']);
