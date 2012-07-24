kampfer.addDependency('app.js', ['mindMap.app'], ['mindMap.MapManager','mindMap.MapController']);
kampfer.addDependency('base.js', [], []);
kampfer.addDependency('branch.js', ['mindMap.Branch'], ['mindMap.Component','style','event']);
kampfer.addDependency('caption.js', ['mindMap.Caption'], ['mindMap.Component','style','event']);
kampfer.addDependency('component.js', ['mindMap.Component'], ['Class','style']);
kampfer.addDependency('config.js', ['mindMap','mindMap.config'], []);
kampfer.addDependency('lib/data.js', ['dataManager'], ['browser.support']);
kampfer.addDependency('lib/dom.js', ['dom'], ['string']);
kampfer.addDependency('lib/event.js', ['event'], ['dataManager']);
kampfer.addDependency('lib/string.js', ['string'], []);
kampfer.addDependency('lib/style.js', ['style'], []);
kampfer.addDependency('lib/support.js', ['browser.support'], []);
kampfer.addDependency('lib/tools/class.js', ['Class'], []);
kampfer.addDependency('lib/tools/json2.js', ['JSON'], []);
kampfer.addDependency('lib/tools/qunit.js', [], []);
kampfer.addDependency('lib/ui/layer.js', ['ui.Layer'], ['Class','dom','style','event']);
kampfer.addDependency('map.js', ['mindMap.Map'], ['event','mindMap.Component','mindMap.Node']);
kampfer.addDependency('mapController.js', ['mindMap.MapController'], ['Class','event','mindMap.Map','mindMap.Node','mindMap.Menu']);
kampfer.addDependency('MapManager.js', ['mindMap.MapManager'], ['Class']);
kampfer.addDependency('MapsManager.js', ['mindMap.MapsManager'], ['Class']);
kampfer.addDependency('menu.js', ['mindMap.Menu','mindMap.MenuItem'], ['mindMap.Component','dom','event']);
kampfer.addDependency('node.js', ['mindMap.Node'], ['style','event','dom','mindMap.Component','mindMap.Branch','mindMap.Caption']);
