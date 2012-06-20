/*global kampfer console*/
kampfer.require('Class');
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.MapController');

/*
 * map控制器类
 * 所有的浏览器事件都在这里被注册。view组件订阅mapController的自定义事件
 */
kampfer.mindMap.MapController = kampfer.Class.extend({
	
	init : function(currentMapManager) {
		
		this.currentMapManager = currentMapManager;
		
		//保存一个map视图的引用
		this.map = null;
		
		//保存所有node视图的引用
		this.nodes = [];
		
		this.currentNode = null;
		
		this.currentState = this.initialState;
		
	},
	
	render : function() {
		
		if(!this.map) {
			this.map = new kampfer.mindMap.Map(this.currentMapManager);
			this.map.render();
		}
		
		if(!this.nodes.length) {
			var nodes = this.currentMapManager.getNodes();
			kampfer.each(nodes, function(id, node){
				this.nodes[id] = new kampfer.mindMap.Node(node);
				this.nodes[id].render();
			});
		}
		
		this.monitorEvents();
		
	},
	
	addNode : function(parent) {
		
		kampfer.event.trigger(this, 'addNode', {
			parent : parent
		});
		
	},
	
	removeNode : function(id) {
		
		kampfer.event.trigger(this, 'removeNode', {
			id : id
		});
		
	},
	
	
	setNodeText : function(id, text) {
		
		kampfer.event.trigger(this, 'setNodeText', {
			id : id,
			text : text
		});
		
	},
	
	monitorEvents : function() {
		
		var that = this;
		
		function handleEvent(event) {
			var controller = that;
			
			var func = controller.action2Function[controller.currentState][event.type];
			controller.currentState = func.call(controller, event);
		}
		
		function handleMenuClick(event) {
			var controller = that,
				command;
				
			command = controller.getCommand(event);
			
			controller.action2Function.editNode(command);
		}
		
		kampfer.addEvent(this.map.element, '*', handleEvent);
		kampfer.addEvent(this.menu.element, 'click', handleMenuClick);
		
	},
	
	action2Function : {
		
		//鼠标在map上
		mapActivated : {
			
			mouseout : function(event) {
				var relatedTarget = event.relatedTarget;
				if( relatedTarget.getAttribute('node-type') === 'node' ) {
					return 'nodeActivated';
				}
				return 'afk';
			},
			
			mousedown : function(event) {
				if(event.button === 1) {
					this.saveCursorPosition(event);
				}else if(event.button === 3) {
					console.log('button = 3');
				}
				return 'mapfocus';
			}

		},
		
		//在map上按住鼠标左键
		mapfocus : {
			
			mousemove : function(event) {
			
				var offsetX = event.pageX - this.lastCursorX,
					offsetY = event.pageY - this.lastCursorY;
						
				kampfer.event.trigger(this, 'moveMap', {
					offsetX: offsetX,
					offsetY : offsetY
				});
				
				return 'mapfocus';
				
			},
			
			mouseup : function(event) {
				return 'mapActivated';
			}
			
		},
		
		//鼠标在node上
		nodeActivated : {
			
			mouserout : function() {
				var relatedTarget = event.relatedTarget;
				if( relatedTarget.getAttribute('node-type') === 'map' ) {
					return 'mapActivated';
				}
			},
			
			mousedown : function(event) {
				
				if(event.button === 3) {
					//显示编辑菜单
					console.log('显示编辑菜单');
					return 'nodeActivated';
				}
				
				this.saveCursorPosition(event);
				this.getCurrentNode(event);
				
				return 'nodefocus';
			}
			
		},
		
		//在node上按住鼠标左键
		nodefocus : {
			
			mousemove : function() {
				var offsetX = event.pageX - this.lastCursorX,
					offsetY = event.pageY - this.lastCursorY;
						
				kampfer.event.trigger(this, 'moveNode', {
					offsetX : offsetX,
					offsetY : offsetY
				});
				
				return 'nodefocus';
			},
			
			mouseup : function() {
				return 'nodeActivated';
			}
			
		},
		
		//鼠标移出了map
		afk : {
			mouseover : function() {
				return 'mapActivated';
			}
		},
		
		editNode : {
			
		}
		
	},
	
	initialState : 'mapActivated',
	
	saveCursorPosition : function(event) {
		this.lastCursorX = event.pageX;
		this.lastCursorY = event.pageY;
	},
	
	getCurrentNode : function(event) {
		var target = event.target;
		
		while( target && target.getAttribute('node-type') !== 'node' ) {
			target = target.parentNode;
		}
		
		if(target) {
			this.currentNode = target;
		}
	},
	
	getCommand : function(event) {
		var element = event.target,
			ret;
			
		while( element && !(ret = element.getAttribute('action'))) {
			element = element.parentNode;
		}
		
		if(!ret) {
			throw 'err';
		}
		
		return ret;
	}
	
});
