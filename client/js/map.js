/*global kampfer console*/
kampfer.require('events');
kampfer.require('dom');
kampfer.require('Component');
kampfer.require('mindMap.Node');
kampfer.require('mindMap.radio');

kampfer.provide('mindMap.Map');

kampfer.mindMap.Map = kampfer.Component.extend({

    _id : 'map',

    currentNode : null,
    
    initializer : function(mapManager) {
        kampfer.mindMap.Map.superClass.initializer.apply(this, arguments);

        this.addChildren( mapManager.getNodeTree() );
    },
    
    decorate : function() {
        this._element.id = this.getId();
        this._element.setAttribute('role', 'map');
        kampfer.dom.addClass(this._element, 'map');

        var that = this, dragingNode = false, x, y;
        kampfer.events.addListener(this._element, 'mousedown', function(event) {
            var role = event.target.getAttribute('role');

            that.currentNode = role === 'caption' ?
                that.getChild(event.target.id).getParent() :
                that.getChild(event.target.id);

            if(event.which === 1) {
                if(role === 'caption' || role === 'node') {
                    dragingNode = true;

                    var position = that.currentNode.getPosition();
                    x = event.pageX - position.left;
                    y = event.pageY - position.top;
                }
            }
        });

        kampfer.events.addListener(this._element, 'mouseup', function(event) {
            if(dragingNode) {
                dragingNode = false;
            }
        });

        kampfer.events.addListener(this._element, 'mousemove', function(event) {
            if(dragingNode) {
                that.currentNode.moveTo(event.pageX - x, event.pageY - y);
                kampfer.mindMap.dispatch({
                    type : 'executeCommand',
                    command : 'SaveNodePosition',
                    nodeId : that.currentNode.getId(),
                    x : event.pageX - x,
                    y : event.pageY - y
                });
                return false;
            }
        });
    },

    addChildren : function(children) {
        if(children) {
            for(var i = 0, l = children.length; i < l; i++) {
                var child = children[i];
                this.addChild( new kampfer.mindMap.Node(child) );
            }
        }
    },

    dispose : function() {
        kampfer.mindMap.Menu.superClass.dispose.apply(this);
        this.currentNode = null;
        kampfer.events.removeListener(this._element);
    }
});