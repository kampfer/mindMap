/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.command');


//失败的尝试,实例command对象时无法随意的传递参数
//TODO 每个命令对象都监听menu的click事件
//TODO 将mapController中的命令操作移动到本文件
kampfer.mindMap.command.Listener = kampfer.Class.extend({

	init : function(controller, menu) {
		kampfer.events.addEvent(menu, 'clickitem', this._handleEvent, this);
		kampfer.events.addEvent(menu, 'show', this._checkCommand, this);

		this.controller = controller;

		this.menu = menu;

		this._tagList = {};
	},

	_tagList : null,

	controller : null,

	addTag : function(tag, command) {
		if(tag in this._tagList) {
			return;
		}

		this._tagList[tag] = command;
	},

	delTag : function(tag) {
		if(tag in this._tagList) {
			this._tagList[tag] = null;
		}
	},

	getCommand : function(tag) {
		if(tag in this._tagList) {
			return this._tagList[tag];
		}
	},

	_handleEvent : function(event) {
		var command = event.currentItem.innerHTML;

		command = this.getCommand(command);

		if(command) {
			if( !command.isAvailable || command.isAvailable() ) {
				command = new command(event, this.controller);
				command.execute(true);
				console.log(kampfer.mindMap.command.index + ': ' + event.currentItem.innerHTML);
			}
		}
	},

	_checkCommand : function(event) {
		for(var name in this._tagList) {
			var command = this._tagList[name];
			if( command && command.isAvailable) {
				if( command.isAvailable() ) {
					this.menu.getChild(name).enable();
				} else {
					this.menu.getChild(name).disable();
				}
			}
		}
	}
	
});


kampfer.mindMap.command.Base = kampfer.Class.extend({
	init : function() {},
	execute : function(needPush) {
		if(needPush) {
			kampfer.mindMap.command.addCommand(this);
		}
	},
	unExecute : function() {},
	dispose : function() {}
});


kampfer.mindMap.command.commandList = [];


kampfer.mindMap.command.index = 0;


kampfer.mindMap.command.addCommand = function(command) {
	var length = this.commandList.length;
	length -= this.index;
	this.commandList.splice(this.index++, length, command);
};


//TODO 目前撤销恢复功能是线性的,需要作成一个循环
kampfer.mindMap.command.redo = function(level) {
	for(var i = 0; i < level; i++) {
		if(this.index < this.commandList.length) {
			var command = this.commandList[this.index++];
			command.execute();
		} else {
			return;
		}
	}
};


kampfer.mindMap.command.undo = function(level) {
	for(var i = 0; i < level; i++) {
		if(this.index > 0) {
			var command = this.commandList[--this.index];
			command.unExecute();
		} else {
			return;
		}
	}
};


kampfer.mindMap.command.CreateNewNode = 
	kampfer.mindMap.command.Base.extend({
		init : function(data, controller) {
			this.controller = controller;
			this.pid = controller.currentNode.getId();
			this.offsetX = data.pageX;
			this.offsetY = data.pageY;
		},

		execute : function(needPush) {
			var controller = this.controller,
				pid = this.pid;

			this._super(needPush);

			if(this.newNode) {
				controller.createNode(this.newNode);

				controller.setNodePosition( this.newNode.id, this.newNode.offset.x, 
					this.newNode.offset.y );
			} else {
				this.newNode = controller.createNode(pid);
			
				if(pid === 'map') {
					var mapPosition = controller.map.getPosition();
					controller.setNodePosition( this.newNode.id,
						Math.abs(mapPosition.left) + this.offsetX,
						Math.abs(mapPosition.top) + this.offsetY );
				}
			}
		},
		
		unExecute : function() {
			this._super();
			this.controller.deleteNode(this.newNode.id);
		}
});


kampfer.mindMap.command.DeleteNode = 
	kampfer.mindMap.command.Base.extend({
		init : function() {
			var nodeId;
			this.controller = arguments[1];
			nodeId = this.controller.currentNode.getId();
			this.oldNodeData = this.controller.currentMapManager.getNode(nodeId, true);
		},
		
		execute : function(needPush) {
			this._super(needPush);
			var id;
			if(this.oldNodeData.length) {
				id = this.oldNodeData[0].id;
			} else {
				id = this.oldNodeData.id;
			}
			this.controller.deleteNode(id);
		},
		
		unExecute : function() {
			this._super();
			if(this.oldNodeData.length) {
				for(var i = 0, l = this.oldNodeData.length; i < l; i++) {
					this.controller.createNode(this.oldNodeData[i]);
				}
			} else {
				this.controller.createNode(this.oldNodeData);
			}
		}
});


kampfer.mindMap.command.SaveNodeContent = 
	kampfer.mindMap.command.Base.extend({
		init : function(nodeId, content, controller) {
			this.nodeId = nodeId;
			this.content = content;
			this.controller = controller;
			this.oriContent = controller.currentMapManager.getNode(nodeId).content;
		},
		
		execute : function(needPush) {
			this._super(needPush);
			this.controller.setNodeContent(this.nodeId, this.content);
		},
		
		unExecute : function() {
			this._super();
			this.controller.setNodeContent(this.nodeId, this.oriContent);
		}
});


kampfer.mindMap.command.SaveNodePosition = 
	kampfer.mindMap.command.Base.extend({
		init : function(id, position, controller) {
			this.nodeId = id;
			this.controller = controller;
			this.newPosition = position;
			
			//保存旧位置
			var nodeData = controller.currentMapManager.getNode(id);
			//保存值而不是引用
			this.lastPosition = {
				left : nodeData.offset.x,
				top : nodeData.offset.y
			};
		},
		
		execute : function(needPush) {
			if( !this.isPositionNotChange() ) {
				this._super(needPush);

				this.controller.setNodePosition(this.nodeId, 
					this.newPosition.left, this.newPosition.top);
			}
		},
		
		unExecute : function() {
			this._super();
			this.controller.setNodePosition(this.nodeId,
				this.lastPosition.left, this.lastPosition.top);
		},

		isPositionNotChange : function() {
			if( this.lastPosition.left === this.newPosition.left &&
				this.lastPosition.top === this.newPosition.top ) {
				return true;
			}
			return false;
		}
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		kampfer.mindMap.command.undo(1);
	},

	unExecute : function() {
		kampfer.mindMap.command.redo(1);
	}
});

kampfer.mindMap.command.Undo.isAvailable = function() {
	if(kampfer.mindMap.command.index <= 0) {
		return false;
	}
	return true;
}



kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		kampfer.mindMap.command.redo(1);
	},

	unExecute : function() {
		kampfer.mindMap.command.undo(1);
	}
});

kampfer.mindMap.command.Redo.isAvailable = function() {
	if(kampfer.mindMap.command.index >= 
		kampfer.mindMap.command.commandList.length) {
		return false;
	} 
	return true;
}


kampfer.mindMap.command.Save = kampfer.mindMap.command.Base.extend({
	init : function() {
		this.controller = arguments[1];
	},
	execute : function() {
		this.controller.saveMap();
	}
});