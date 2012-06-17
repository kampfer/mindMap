/*global kampfer console*/

/*
 * map控制器类。接受json数据，生成map视图
 */
kampfer.require('dom');
kampfer.require('style');
kampfer.require('event');
kampfer.require('ui.Layer');
kampfer.require('mindMap.NodeController');

kampfer.provide('mindMap.MapController');

kampfer.mindMap.MapController = kampfer.ui.Layer.extend({
	
	init : function(data, opts) {
		
		this._super(opts);
		
		this.nodes = [];
		
		this.data = data;
		
		this.parse(data.nodes);

	},
	
	//overwrite
	render : function() {
		
		this.enterDocument();
		
		for(var i = 0, l = this.nodes.length; i < l; i++) {
			this.nodes[i].render();
		}
		
	},
	
	parse : function(data) {
		if(!this.element) {
			this.createElement();	
		}
		
		for(var item in data) {
			var node = data[item];
			this.nodes.push( new kampfer.mindMap.NodeController(node, {
				cssName : 'node',
				parentNode : this.element
			}) );
		}
	},
	
	show : function() {
		
		//自定义事件show的发生时间有偏差
		this._super();
		
		for(var i = 0, l = this.nodes.length; i < l; i++) {
			this.nodes[i].show();
		}
		
	},
	
	hide : function() {
		
		//自定义事件hide的发生时间有偏差
		this._super();
		
		for(var i = 0, l = this.nodes.length; i < l; i++) {
			this.nodes[i].hide();
		}
		
	}
	
});