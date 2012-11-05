/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('events');
kampfer.require('BlobBuilder');
kampfer.require('saveAs');
kampfer.require('mindMap.Node');
kampfer.require('mindMap.MapController');
kampfer.require('mindMap.MapManager');

kampfer.provide('mindMap.command');


kampfer.mindMap.command.commandList = [];


kampfer.mindMap.command.index = 0;


kampfer.mindMap.command.Base = kampfer.Class.extend({
	init : function() {},

	execute : function() {},

	unExecute : function() {},

	needPush : false,

	//command默认是可执行的
	isAvailable : function() {
		return true;
	},

	push2Stack : function() {
		if( this.needPush ) {
			var kmc = kampfer.mindMap.command;
			var length = kmc.commandList.length - kmc.index;
			kmc.commandList.splice(kmc.index++, length, this);
		}
	},

	dispose : function() {}
});


//createNode 不维护后代节点
kampfer.mindMap.command.CreateNode = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, controller) {
		this.map = map;
		this.mapManager = mapManager;
		this.commandTargt = map.currentNode;

		var mapPosition = map.getPosition();
		if(this.commandTargt.getId() === 'map') {
			this.offsetX = Math.abs(mapPosition.left) + controller.lastPageX;
			this.offsetY = Math.abs(mapPosition.top) + controller.lastPageY;
		}
	},

	nodeData : null,

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		if(!this.nodeData) {
			var node = {
				parent : this.commandTargt.getId()
			};
			if(node.parent === 'map') {
				node.offset = {};
				node.offset.x = this.offsetX;
				node.offset.y = this.offsetY;
			}
			this.nodeData = this.mapManager.createNode(node);
		}
		this.mapManager.addNode(this.nodeData);
		this.commandTargt.addChild(
			new kampfer.mindMap.Node(this.nodeData, this.mapManager), true );

		document.title = this.mapManager.getMapName() + '*';
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.commandTargt.removeChild(this.nodeData.id, true);
		this.mapManager.deleteNode(this.nodeData.id);

		document.title = this.mapManager.getMapName() + '*';
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.DeleteNode = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
		this.map = map;
		this.mapManager = mapManager;
		this.commandTarget = map.currentNode.getParent();
		this.nodeId = map.currentNode.getId();
	},

	nodeData : null,

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		if(!this.nodeData) {
			this.nodeData = this.mapManager.getNode(this.nodeId, true);
		}
		this.commandTarget.removeChild(this.nodeId, true);
		this.mapManager.deleteNode(this.nodeId);

		document.title = this.mapManager.getMapName() + '*';
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var node;
		if(this.nodeData.length) {
			for(var i = 0, l = this.nodeData.length; i < l; i++) {
				node = this.mapManager.createNode(this.nodeData[i]);
				this.mapManager.addNode(node);
			}
			//node类会自动添加后代节点，所以不在循环中添加addChild
			this.commandTarget.addChild( 
				new kampfer.mindMap.Node(this.nodeData[0], this.mapManager), true );
		} else {
			node = this.mapManager.createNode(this.nodeData);
			this.mapManager.addNode(node);
			this.commandTarget.addChild( 
				new kampfer.mindMap.Node(node, this.mapManager), true );
		}

		document.title = this.mapManager.getMapName() + '*';
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.SaveNodePosition = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		this.nodeId = map.currentNode.getId();
		this.newPos = this.map.getNode(this.nodeId).getPosition();
		this.oriPos = mapManager.getNodePosition(this.nodeId);
	},

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		//不需要再改变view的位置
		//不直接使用map.currentNode是因为它会随时改变
		this.map.getNode(this.nodeId).moveTo(this.newPos.left, this.newPos.top);
		this.mapManager.setNodePosition(this.nodeId, this.newPos.left, this.newPos.top);

		document.title = this.mapManager.getMapName() + '*';
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.map.getNode(this.nodeId).moveTo(this.oriPos.left, this.oriPos.top);
		this.mapManager.setNodePosition(this.nodeId, this.oriPos.left, this.oriPos.top);

		document.title = this.mapManager.getMapName() + '*';
	},

	dispose : function() {
		this.map = null;
		this.mapManager = null;
		this.newPos = null;
		this.oriPos = null;
	}
});


kampfer.mindMap.command.SaveNodeContent = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
		this.map = map;
		this.mapManager = mapManager;
		this.mapController = mapController;
		this.nodeId = map.currentNode.getId();
		this.oriContent = mapManager.getNodeContent(this.nodeId);
	},

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var caption = this.map.getNode(this.nodeId).getCaption();
		if(!this.newContent) {
			this.newContent = caption.insertText();
		}
		caption.setContent(this.newContent);
		this.mapManager.setNodeContent(this.nodeId, this.newContent);

		document.title = this.mapManager.getMapName() + '*';
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.map.getNode(this.nodeId).getCaption().setContent(this.oriContent);
		this.mapManager.setNodeContent(this.nodeId, this.oriContent);

		document.title = this.mapManager.getMapName() + '*';
	},

	dispose : function() {
		this.map = null;
		this.mapManager = null;
		this.mapController = null;
	}
});


kampfer.mindMap.command.SaveMap = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.mapManager = mapManager;
	},

	execute : function() {
		if( this.isAvailable() ) {
			this.mapManager.saveMap();

			document.title = this.mapManager.getMapName();
		}
	},

	isAvailable : function() {
		return this.mapManager.isModified();
	},

	dispose : function() {
		this.mapManager = null;
	}
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
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
	init : function(map, mapManager) {
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


kampfer.mindMap.command.CreateNewMap = kampfer.mindMap.command.Base.extend({
	init : function(data, localstore) {
		this.data = data;
		this.localstore = localstore;
	},

	execute : function() {
		var manager = new kampfer.mindMap.MapManager(this.data, this.localstore);
		document.title = manager.getMapName();
		controller = new kampfer.mindMap.MapController(manager, this.localstore);
		controller.render();
		controller.monitorEvents();
		return controller;
	}
});


kampfer.mindMap.command.SaveAsText = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.mapManager = mapManager;
	},

	execute : function() {
		var content = this.mapManager.dataToJSON();
		var mapName = this.mapManager.getMapName();
		//The standard W3C File API BlobBuilder interface is not available in all browsers. 
		//BlobBuilder.js is a cross-browser BlobBuilder implementation that solves this.
		var bb = new kampfer.BlobBuilder();
		bb.append(content);
		kampfer.saveAs( bb.getBlob('text/plain;charset=utf-8'), mapName + '.txt' );
	}
});


kampfer.mindMap.command.RenameMap = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.mapManager = mapManager;
	},

	execute : function() {
		do {
			var newName = prompt('请输入新map名:');
		} while(newName === '')

		if(newName) {
			this.mapManager.setMapName(newName);
			document.title = newName + '*';
		}
	}
});


kampfer.mindMap.command.Copy = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.commandTarget = map.currentNode;
		this.mapManager = mapManager;
	},

	execute : function() {
		var nodeId = this.commandTarget.getId();
		var data = kampfer.extend( true, [], this.mapManager.getNode(nodeId, true) );
		for(var i = 0, d; d = data[i]; i++) {
			//仅仅清空了自身保存的id,而没有清除parent的children属性中保存的id
			d.id = null;
		}
		//copy的节点数据必须处理．保证node id唯一
		this.mapManager._localStore.setClipboard(data);
	}
});


kampfer.mindMap.command.Cut = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
		this.map = map;
		this.mapManager = mapManager;
		this.commandTarget = map.currentNode;
	},

	execute : function() {
		var nodeId = this.commandTarget.getId();
		var data = this.mapManager.getNode(nodeId, true);
		this.mapManager._localStore.setClipboard(data);
		//删除节点
		this.commandTarget.getParent().removeChild(nodeId, true);
		this.mapManager.deleteNode(nodeId);

		document.title = this.mapManager.getMapName() + '*';
	},

	needPush : true
});


kampfer.mindMap.command.Paste = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
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
		this.nodeData = this.mapManager._localStore.getClipboard();
		this.mapManager._localStore.removeClipboard();

		var nodeData = this.nodeData.length ? this.nodeData[0] : this.nodeData;
		var pid = this.commandTarget.getId();
		nodeData.parent = pid;
		if(this.commandTarget.getId() === 'map') {
			var mapPosition = this.map.getPosition();
			nodeData.offset.x = Math.abs(mapPosition.left) + this.mapController.lastPageX;
			nodeData.offset.y = Math.abs(mapPosition.top) + this.mapController.lastPageY;
		}  else {
			nodeData.offset.x = 100;
			nodeData.offset.y = 100;
		}

		if(this.nodeData.length) {
			for(var i = 0, l = this.nodeData.length; i < l; i++) {
				this.nodeData[i] = this.mapManager.createNode(this.nodeData[i]);
				this.mapManager.addNode(this.nodeData[i]);
			}
			//node类会自动添加后代节点，所以不在循环中添加addChild
			this.commandTarget.addChild(
				new kampfer.mindMap.Node(this.nodeData[0], this.mapManager), true );
		}

		document.title = this.mapManager.getMapName() + '*';
	},

	unExecute : function() {
		var node = this.nodeData.length ? this.nodeData[0] : this.nodeData;
		this.commandTarget.removeChild(node.id, true);
		this.mapManager.deleteNode(node.id);

		document.title = this.mapManager.getMapName() + '*';
	},

	needPush : true
});