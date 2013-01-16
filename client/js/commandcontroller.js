/*global kampfer*/
kampfer.require('Class');
kampfer.require('mindMap.command');
kampfer.require('mindMap.radio');

kampfer.provide('mindMap.command.Controller');

//暂时长这样吧#_#
//以后再改
kampfer.mindMap.command.Controller = kampfer.Class.extend({
	initializer : function() {
		this.commandStack = [];
		this.commandStackIndex = 0;

		kampfer.mindMap.radio.addListener('executeCommand', this.doCommand, this);
		kampfer.mindMap.radio.addListener('beforemenushow', this.checkCommand, this);
	},

	checkCommand : function(event, menu) {
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
		console.log(event.command);
		if(command) {
			var ret = command(event);
			if(ret) {
				this.commandStack[this.commandStackIndex++] = ret;
			}
		}
	},

	commandStack : null,

	commandStackIndex : null,

	dispose : function() {
		kampfer.mindMap.CommandController.superClass.dispose.apply(this, arguments);
		this.publishers = null;
		this.commandStack = null;
	}
});