/*global kampfer console*/
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');
kampfer.require('mindMap.Branch');

kampfer.provide('mindMap.Node');

kampfer.mindMap.Node = kampfer.ui.Layer.extend({
	
	init : function(controller, manager) {
		
		this._super({cssName : 'node'});
		
		this.controller = controller;
		
		this.manager = manager;
		
	},
	
	listenController : function() {}
	
});