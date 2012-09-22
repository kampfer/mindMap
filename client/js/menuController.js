/*global kampfer*/

kampfer.provide('mindMap.MenuController');

kampfer.require('Class');
kampfer.require('events');
kampfer.require('mindMap.Menu');
kampfer.require('mindMap.commandManager');


kampfer.mindMap.MenuController = kampfer.Class.extend({
	
	init : function(mapController) {
		this.mapController = mapController;
		this.mapMenu = new kampfer.mindMap.Menu();
		this.nodeMenu = new kampfer.mindMap.Menu();
	},
	
	bind : function(mapController) {
		//默认使用MenuController被创建时传入的mapController
		if(!mapController) {
			mapController = this.mapController;
		}
		
		var that = this;
		
		function handleEvent(event) {
			var controller = that;
			
			var func = controller.action2Function[event.type];
			if(!func) {
				func = controller.action2Function.unexceptedEvent;
			}
			
			func.call(controller, event);
			
		}
		
		kampfer.events.addEvent(mapController, 'showMenu', handleEvent);
	},
	
	addItems : function(list) {
		this.mapMenu.addItem( 
			new kampfer.mindMap.MenuItem('添加子节点', function() {}) 
		);
	},
	
	showMenu : function() {
		this.menu.show();
	},
	
	hideMenu : function() {
		this.menu.hide();
	},
	
	//已有menuItem的列表
	menus : [],
	
	action2Function : {
		
		showMenu : function(event) {
			var state = this.mapController.currentState;
			
			//确定需要显示哪种菜单
			var menu;
			if(state === 'mapActivated') {
				menu = this.mapMenu;
			} else if(state === 'nodeActivated') {
				menu = this.nodeMenu;
			}
			
			menu.setPosition(event.pageX, event.pageY);
			menu.show();
		},
		
		unexceptedEvent : function() {return;}
	}	
});