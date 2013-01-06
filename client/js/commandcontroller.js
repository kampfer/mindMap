kampfer.require('evnets.EventTarget');
kampfer.require('mindMap.command');
kampfer.require('events');

kampfer.provide('mindMap.CommandController');

kampfer.mindMap.CommandController = kampfer.events.EventTarget.extend({
	initializer : function() {
		this.commandStack = [];
		this.commandStackIndex = 0;
		this.publishers = [];

		for(var i = 0, a; a = arguments[i]; i++) {
			this.subscrible(a);
		}
	},

	commandStack : null,

	commandStackIndex : null,

	publishers : null,

	subscrible : function(target) {
		this.publishers.push(target);
		kampfer.events.addListener(target, 'executeCommand', funciton(event) {
			kampfer.mindMap.command[name]();
		});
	},

	undo : function(level) {
		level = level || 1;
	},

	redo : function(level) {
		level = level || 1;
	},

	dispose : function() {
		kampfer.mindMap.CommandController.superClass.dispose.apply(this, arguments);
		for(var i = 0, p; p = this.publishers[i]; i++) {
			kampfer.events.removeListener(p, 'executeCommand');	
		}
		this.publishers = null;
		this.commandStack = null;
	}
});