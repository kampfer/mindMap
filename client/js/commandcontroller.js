/*global kampfer*/
kampfer.require('Class');
kampfer.require('mindMap.command');
kampfer.require('mindMap.map');
kampfer.require('mindMap.mapManager');
kampfer.require('mindMap.command.stack');
kampfer.require('mindMap.radio');

kampfer.provide('mindMap.command.Controller');

//暂时长这样吧#_#
//以后再改
kampfer.mindMap.command.Controller = kampfer.Class.extend({
	initializer : function(window) {
		this.view = window;

		kampfer.mindMap.radio.addListener('executeCommand', this.doCommand, this);
	},

	getCommand : function(name) {
		return kampfer.mindMap.command[name] ||
			kampfer.mindMap.command.Base;
	},

	doCommand : function(event) {
		var Command = kampfer.mindMap.command[event.command], command;
		if( Command && (!Command.isAvailable || Command.isAvailable()) ) {
			command = new Command(event, this.view);
			command.execute();
			if(command.needPush) {
				kampfer.mindMap.command.stack.push(command);
			} else {
				command.dispose();
			}
		}
		
		if(kampfer.mindMap.mapManager) {
			if( kampfer.mindMap.mapManager.isModified() ) {
				document.title = '*' + kampfer.mindMap.mapManager.getMapName();
			} else {
				document.title = kampfer.mindMap.mapManager.getMapName();
			}
		}
	},

	isCommandAvalilable : function(command) {
		command = this.getCommand(command);
		if( command.isAvailable && !command.isAvailable() ) {
			return false;
		} else {
			return true;
		}
	},

	dispose : function() {
		kampfer.mindMap.CommandController.superClass.dispose.apply(this, arguments);
		this.publishers = null;
		this.commandStack = null;
	}
});