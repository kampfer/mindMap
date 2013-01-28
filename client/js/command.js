/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('JSON');
kampfer.require('BlobBuilder');
kampfer.require('saveAs');
kampfer.require('mindMap.Node');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.MapManager');
kampfer.require('mindMap.MapsManager');

kampfer.provide('mindMap.command');
kampfer.provide('mindMap.map');
kampfer.provide('mindMap.mapManager');
kampfer.provide('mindMap.mapsManager');
kampfer.provide('mindMap.command.commandStack');

kampfer.mindMap.map = null;

kampfer.mindMap.mapManager = null;

kampfer.mindMap.mapsManager = new kampfer.mindMap.MapsManager('mindMap');

kampfer.mindMap.command.Base = kampfer.Class.extend({
    initializer : function() {},

    execute : function() {},

    unExecute : function() {},

    needPush : false,

    dispose : function() {}
});


kampfer.mindMap.command.CreateNewMap = kampfer.mindMap.command.Base.extend({
    initializer : function(data, view) {
        this.view = view;
    },

    execute : function() {
        kampfer.mindMap.mapManager = new kampfer.mindMap.MapManager();

        kampfer.mindMap.map = new kampfer.mindMap.Map(kampfer.mindMap.mapManager);

        this.view.addChild(kampfer.mindMap.map, true);

        document.title = kampfer.mindMap.mapManager.getMapName();
    },

    dispose : function() {
        delete this.view;
    }
});

kampfer.mindMap.command.CreateNewMap.isAvailable = function() {
    if(kampfer.mindMap.map || kampfer.mindMap.mapManager) {
        return false;
    }
    return true;
};


kampfer.mindMap.command.SaveMapInStorage = kampfer.mindMap.command.Base.extend({

});

kampfer.mindMap.command.SaveMapInStorage.isAvailable = function() {
    if(kampfer.mindMap.map && kampfer.mindMap.mapManager) {
        return true;
    }
    return false;
};


kampfer.mindMap.command.SaveMapInDisk = kampfer.mindMap.command.Base.extend({
    execute : function() {
        var content = JSON.stringify( kampfer.mindMap.mapManager.getMapData() );
        var mapName = kampfer.mindMap.mapManager.getMapName();
        //The standard W3C File API BlobBuilder interface is not available in all browsers.
        //BlobBuilder.js is a cross-browser BlobBuilder implementation that solves this.
        var bb = new kampfer.BlobBuilder();
        bb.append(content);
        kampfer.saveAs( bb.getBlob('text/plain;charset=utf-8'), mapName + '.json' );

        document.title = kampfer.mindMap.mapManager.getMapName();
    }
});

kampfer.mindMap.command.SaveMapInDisk.isAvailable =
    kampfer.mindMap.command.SaveMapInStorage.isAvailable;

kampfer.mindMap.command.OpenMapInDisk = kampfer.mindMap.command.Base.extend({
    initializer : function(data, view) {
        if(!kampfer.mindMap.command.OpenMapInStorage.input) {
            var input = kampfer.mindMap.command.OpenMapInStorage.input =
                document.getElementById('mapJson');
        
            kampfer.events.addListener(input, 'change', function(e){
                if (window.File && window.FileReader && window.FileList && window.Blob) {
                    var files = e.target.files;
                    for(var i = 0, f; (f = files[i]); i++) {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            var result = e.target.result;
                            var data = JSON.parse(result);

                            kampfer.mindMap.mapManager = new kampfer.mindMap.MapManager(data);
                            kampfer.mindMap.map = new kampfer.mindMap.Map(kampfer.mindMap.mapManager);
                            view.addChild(kampfer.mindMap.map, true);
                            document.title = kampfer.mindMap.mapManager.getMapName();
                        };
                        reader.readAsText(f);
                    }
                } else {
                    alert('浏览器不支持html5 files api');
                }
            });
        }
    },

    execute : function(data, view) {
        kampfer.events.dispatch(kampfer.mindMap.command.OpenMapInStorage.input, 'click');
    }
});

kampfer.mindMap.command.OpenMapInDisk.isAvailable =
    kampfer.mindMap.command.CreateNewMap.isAvailable;


kampfer.mindMap.command.OpenMapInStorage = kampfer.mindMap.command.Base.extend({

});

kampfer.mindMap.command.OpenMapInStorage.isAvailable =
    kampfer.mindMap.command.CreateNewMap.isAvailable;


kampfer.mindMap.command.RenameMap = kampfer.mindMap.command.Base.extend({

});


kampfer.mindMap.command.CreateNewRootNode = kampfer.mindMap.command.Base.extend({
    initializer : function(data) {
        var nodeData = kampfer.mindMap.mapManager.createNode(),
            window = kampfer.mindMap.map.getParent();
        nodeData.offset.x = data.pageX + window.scrollLeft();
        nodeData.offset.y = data.pageY + window.scrollTop();
        this.nodeData = nodeData;
    },

    execute : function() {
        var node = new kampfer.mindMap.Node(this.nodeData),
            parent;

        if(this.nodeData.parent) {
            parent = kampfer.mindMap.map.getChild(this.nodeData.parent);
        } else {
            parent = kampfer.mindMap.map;
        }

        kampfer.mindMap.mapManager.addNode(this.nodeData);
        parent.addChild(node, true);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    unExecute : function() {
        kampfer.mindMap.map.removeChild(this.nodeData.id, true);
        this.mapManager.deleteNode(this.nodeData.id);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    dispose : function() {
        delete this.nodeData;
    },

    needPush : true
});

kampfer.mindMap.command.CreateNewRootNode.isAvailable = function() {
    if(kampfer.mindMap.map) {
        return true;
    }
    return false;
};


kampfer.mindMap.command.AppendChildNode = kampfer.mindMap.command.CreateNewRootNode.extend({
    initializer : function() {
        var nodeData = kampfer.mindMap.mapManager.createNode();
        nodeData.parent = kampfer.mindMap.map.currentNode.getId();
        this.nodeData = nodeData;
    }
});

kampfer.mindMap.command.AppendChildNode.isAvailable = function() {
    if(kampfer.mindMap.map.currentNode) {
        return true;
    }
    return false;
};


kampfer.mindMap.command.DeleteNode = kampfer.mindMap.command.Base.extend({
    initializer : function(data) {
        var id = kampfer.mindMap.map.currentNode.getId();
        this.nodeData = kampfer.mindMap.mapManager.getNode(id);
    },

    needPush : true,

    execute : function() {
        var parent;
        if(this.nodeData.parent) {
            parent = kampfer.mindMap.map.getChild(this.nodeData.parent);
        } else {
            parent = kampfer.mindMap.map;
        }

        parent.removeChild(this.nodeData.id, true);
        kampfer.mindMap.mapManager.deleteNode(this.nodeData.id);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    unExecute : function() {
        var node = new kampfer.mindMap.Node(this.nodeData),
            parent;

        if(this.nodeData.parent) {
            parent = kampfer.mindMap.map.getChild(this.nodeData.parent);
        } else {
            parent = kampfer.mindMap.map;
        }

        kampfer.mindMap.mapManager.addNode(this.nodeData);
        parent.addChild(node, true);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    dispose : function() {
        delete this.nodeData;
    }
});


kampfer.mindMap.command.SaveNodePosition = kampfer.mindMap.command.Base.extend({
    initializer : function(data) {
        var id = data.nodeId,
            nodeData = kampfer.mindMap.mapManager.getNode(id);

        this.oriX = nodeData.offset.x;
        this.oriY = nodeData.offset.y;

        nodeData.offset.x = data.x;
        nodeData.offset.y = data.y;

        this.nodeData = nodeData;
    },

    needPush : true,

    execute : function() {
        kampfer.mindMap.map.currentNode.moveTo(this.nodeData.x, this.nodeData.y);
        kampfer.mindMap.mapManager.setNodePosition(this.nodeData.id,
            this.nodeData.offset.x, this.nodeData.offset.y);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    unExecute : function() {
        kampfer.mindMap.map.currentNode.moveTo(this.oriX, this.oriY);
        kampfer.mindMap.mapManager.setNodePosition(this.nodeData.id, this.oriX, this.oriY);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    dispose : function() {
        delete this.nodeData;
        delete this.oriY;
        delete this.oriX;
    }
});


kampfer.mindMap.command.EditNodeContent = kampfer.mindMap.command.Base.extend({
    execute : function() {
        kampfer.mindMap.map.currentNode.getCaption().insertTextarea();
    }
});


kampfer.mindMap.command.SaveNodeContent = kampfer.mindMap.command.Base.extend({
    initializer : function(data) {
        var id = data.nodeId;
        this.view = kampfer.mindMap.map.getChild(id);
        this.oriContent = this.view.getCaption().getContent();
        this.newContent = this.view.getCaption().getTextareaValue();
    },

    needPush : true,

    execute : function() {
        this.view.getCaption().setContent(this.newContent);
        kampfer.mindMap.mapManager.setNodeContent(this.view.getId(), this.newContent);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    unExecute : function() {
        this.view.getCaption().setContent(this.oriContent);
        this.mapManager.setNodeContent(this.view.getId(), this.oriContent);

        document.title =  '*' + kampfer.mindMap.mapManager.getMapName();
    },

    dispose : function() {
        delete this.view;
        delete this.oriContent;
        delete this.newContent;
    }
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
    initializer : function(map, mapManager) {
        this.mapManager = mapManager;
    },

    execute : function() {
        if( !this.isAvailable() ) {
            return;
        }
        var kmc = kampfer.mindMap.command;
        for(var i = 0; i < this.level; i++) {
            if(kmc.index > 0) {
                var command = kmc.commandList[--kmc.index];
                command.unExecute();
            } else {
                return;
            }
        }

        document.title = this.mapManager.getMapName() + '*';
    },

    level : 1,

    isAvailable : function() {
        if(kampfer.mindMap.command.index <= 0) {
            return false;
        }
        return true;
    }
});


kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
    initializer : function(map, mapManager) {
        this.mapManager = mapManager;
    },

    execute : function() {
        if( !this.isAvailable() ) {
            return;
        }
        var kmc = kampfer.mindMap.command;
        for(var i = 0; i < this.level; i++) {
            if(kmc.index <kmc.commandList.length) {
                var command = kmc.commandList[kmc.index++];
                command.execute();
            } else {
                return;
            }
        }

        document.title = this.mapManager.getMapName() + '*';
    },

    level : 1,

    isAvailable : function() {
        if( kampfer.mindMap.command.index >=
            kampfer.mindMap.command.commandList.length ) {
            return false;
        }
        return true;
    }
});


kampfer.mindMap.command.Copy = kampfer.mindMap.command.Base.extend({
    initializer : function(map, mapManager) {
        this.commandTarget = map.currentNode;
        this.mapManager = mapManager;
    },

    execute : function() {
        var nodeId = this.commandTarget.getId();
        var node = kampfer.extend( true, {}, this.mapManager.getNode(nodeId) );
        //copy的节点数据必须处理．保证node id唯一
        //清除节点的id
        this.mapManager.traverseNode(node, function(node) {
            node.id = null;
        });
        
        this.mapManager._localStore.setClipboard(node);
    }
});


kampfer.mindMap.command.Cut = kampfer.mindMap.command.Base.extend({
    initializer : function(map, mapManager, mapController) {
        this.map = map;
        this.mapManager = mapManager;
        this.commandTarget = map.currentNode;
    },

    execute : function() {
        if(!this.nodeData) {
            var nodeId = this.commandTarget.getId();
            this.nodeData = this.mapManager.getNode(nodeId);

            var data = kampfer.extend(true, {}, this.nodeData);
            //清除节点的id
            //使用已有数据创建节点时,如果没有id,会自动设置id,并且设置child的parent属性
            //使之总是指向正确的父节点
            this.mapManager.traverseNode(data, function(node) {
                node.id = null;
            });
            this.mapManager._localStore.setClipboard(data);
        }

        //删除节点
        //不能使用commandTarget.getParent()。因为removeChild之后commandTarget到
        //parent的引用就被断开了。redo undo时会报错。
        this.map.getNode(this.nodeData.parent).removeChild(this.nodeData.id, true);
        this.mapManager.deleteNode(this.nodeData.id);

        document.title = this.mapManager.getMapName() + '*';
    },

    unExecute : function() {
        this.mapManager.addNode(this.nodeData);
        //node类会自动添加后代节点，所以不在循环中添加addChild
        this.map.getNode(this.nodeData.parent).addChild(
            new kampfer.mindMap.Node(this.nodeData, this.mapManager), true );

        document.title = this.mapManager.getMapName() + '*';
    },

    needPush : true
});


kampfer.mindMap.command.Paste = kampfer.mindMap.command.Base.extend({
    initializer : function(map, mapManager, mapController) {
        this.map = map;
        this.mapManager = mapManager;
        this.mapController = mapController;
        this.commandTarget = map.currentNode;
    },

    isAvailable : function() {
        var clipboard = this.mapManager._localStore.getClipboard();
        if( !clipboard || clipboard.length <= 0) {
            return false;
        }
        return true;
    },

    execute : function() {
        if(!this.nodeData) {
            this.nodeData = this.mapManager._localStore.getClipboard();
        
            //重置node的坐标，parent
            var pid = this.commandTarget.getId();
            this.nodeData.parent = pid;
            if(this.commandTarget.getId() === 'map') {
                var mapPosition = this.map.getPosition();
                this.nodeData.offset.x = Math.abs(mapPosition.left) + this.mapController.lastPageX;
                this.nodeData.offset.y = Math.abs(mapPosition.top) + this.mapController.lastPageY;
            }  else {
                this.nodeData.offset.x = 100;
                this.nodeData.offset.y = 100;
            }
        }

        this.nodeData = this.mapManager.createNode(this.nodeData);
        this.mapManager.addNode(this.nodeData);

        //node类会自动添加后代节点，所以不在循环中添加addChild
        this.commandTarget.addChild(
            new kampfer.mindMap.Node(this.nodeData, this.mapManager), true );
        

        document.title = this.mapManager.getMapName() + '*';
    },

    unExecute : function() {
        var node = this.nodeData;
        this.commandTarget.removeChild(node.id, true);
        this.mapManager.deleteNode(node.id);

        document.title = this.mapManager.getMapName() + '*';
    },

    needPush : true
});