/*global kampfer console*/
kampfer.require('events');
kampfer.require('dom');
kampfer.require('Component');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Map');
kampfer.provide('mindMap.nodeContextMenu');


kampfer.mindMap.nodeContextMenu = new kampfer.Menu( document.getElementById('node-context-menu') );

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

            kampfer.mindMap.nodeContextMenu.hide();

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
                return false;
            }
        });

        kampfer.events.addListener(this._element, 'contextmenu', function(event) {
            var role = event.target.getAttribute('role');
            if(role === 'caption' || role === 'node') {
                var parentElement = that.getParent().getElement(),
                    scrollX = kampfer.dom.scrollLeft(parentElement),
                    scrollY = kampfer.dom.scrollTop(parentElement);
                kampfer.mindMap.nodeContextMenu.setPosition(event.pageX + scrollX, event.pageY + scrollY);
                kampfer.mindMap.nodeContextMenu.show();
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