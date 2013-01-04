kampfer.require('evnets.EventTarget');
kampfer.require('mindMap.command');
kampfer.require('events');

kampfer.provide('mindMap.CommandController');

kampfer.mindMap.CommandController = kampfer.events.EventTarget.extend({
	initializer : function() {
		for(var i = 0, a; a = arguments[i]; i++) {
			this.subscrible(a);
		}
	},

	subscrible : function(target) {
		kampfer.events.addListener(target, 'executeCommand', funciton(event, name) {
			kampfer.mindMap.command[name]();
		});
	}
});