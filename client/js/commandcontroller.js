/*global kampfer*/
kampfer.require('events.EventTarget');
kampfer.require('mindMap.command');

kampfer.provide('mindMap.command.Controller');
kampfer.provide('mindMap.command.controller');

//暂时长这样吧#_#
//以后再改
kampfer.mindMap.command.Controller = kampfer.events.EventTarget.extend({
	initializer : function() {
		this.commandStack = [];
		this.commandStackIndex = 0;
	},

	subscribe : function(obj) {
		obj.addListener('beforeshow', this.checkCommand, this);
		obj.addListener('executeCommand', this.doCommand, this);
	},

	checkCommand : function(event) {
		var menu = event.target;
		var commands = menu.getElement().querySelectorAll('[command]');
		for(var i = 0, command; command = commands[i]; i++) {
			var name = command.getAttribute('command');
			command = kampfer.mindMap.command[name];
			if( command && command.isAvailable && !command.isAvailable() ) {
				menu.disable(i);
			} else {
				menu.enable(i);
			}
		}
	},

	doCommand : function(event) {
		var command = kampfer.mindMap.command[event.command];
		if(command) {
			var ret = command(event);
			if(ret) {
				this.commandStack[this.commandStackIndex++] = ret;
			}
		}
		this.dispatch.apply(this, arguments);
	},

	commandStack : null,

	commandStackIndex : null,

	dispose : function() {
		kampfer.mindMap.CommandController.superClass.dispose.apply(this, arguments);
		this.publishers = null;
		this.commandStack = null;
	}
});

kampfer.mindMap.command.controller = new kampfer.mindMap.command.Controller();