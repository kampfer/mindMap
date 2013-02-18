kampfer.require('events.EventTarget');

kampfer.provide('UIComponent');

kampfer.UIComponent = kampfer.events.EventTarget.extend({
    initializer : function() {},
    
    _id : null,
    
    _inDocument : false,
    
    _element : null,
    
    isInDocument : function() {
        return this._inDocument;
    },
    
    createDom : function() {
        this._element = kampfer.global.document.createElement('div');
    },
    
    decorate : function() {},
    
    enterDocument : function() {},
    
    exitDocument : function() {},
    
    render : function() {},
    
    getElement : function() {
        return this._element;
    },
    
    setElement : function(element) {
        this._element = element;
    },
    
    dispose : function() {
        kampfer.UIComponent.superClass.dispose.call(this);
        delete this._element;
    },
    
    /******************************************************
     * 实现composition模式
     *****************************************************/
    _parent : null,
    
    //array
    //_children必须与_childrenIndex同步
    //懒加载
    _children : null,
    
    //object
    //_childrenIndex必须与_children同步
    //懒加载
    _childrenIndex : null,
    
    getId : function() {
        return this._id ||
            ( this._id = kampfer.UIComponent.generateUniqueId() );
    },
    
    setId : function(id) {
        if(this._parent && this._parent._childrenIndex) {
            delete this._parent._childrenIndex[this._id];
            this._parent._childrenIndex[id] = this;
        }

        this._id = id;
    },
    
    getParent : function() {
        return this._parent;
    },
    
    setParent : function(parent) {
        //新的parent不为空时，必须是component实例
        if( parent && !(parent instanceof kampfer.UIComponent) ) {
            return;
        }

        //新的parent不能是对象自己
        if(parent === this) {
            return;
        }

        //对象已经是另一个对象的child，那么必须先调用removeChild之后再调用setParent
        //对象不可能同时是另外两个对象的child
        if( parent && this._parent && this._id &&
            this._parent.getChild(this._id) && parent !== this._parent ) {
            return;
        }

        this._parent = parent;
        this.setParentEventTarget(parent);

        //对象不是新parent的child，那么将child添加到parnet的子列表中
        //因为addchild方法会检查_parent属性，所以必须在设置完_parent属性后才能执行添加操作
        if( parent && !parent.getChild(this._id) ) {
            parent.addChild(this);
        }
    },
    
    addChild : function(child, render) {
        this.addChildAt(child, this.getChildCount(), render);
    },
    
    addChildAt : function(child, index, render) {
        if( !(child instanceof kampfer.UIComponent) ) {
            return;
        }

        if(index < 0 || index > this.getChildCount() ) {
            return;
        }

        if( render && child.isInDocument() && !this._inDocument ) {
            return;
        }

        if(!this._children || !this._childrenIndex) {
            this._children = [];
            this._childrenIndex = {};
        }

        if( !this.getChild( child.getId() ) ) {
            this._childrenIndex[child.getId()] = child;
        }

        function insertItem2Array(array, item, index) {
            var oldIndex;
            for(var i = 0, c; c = array[i]; i++) {
                if(c === item) {
                    oldIndex = i;
                }
            }
            array.splice(index, item, 0);
            array.splice(oldIndex, 0);
        }

        insertItem2Array(this._children, child, index);

        if(child._parent !== this) {
            child.setParent(this);
        }
    },
    
    getChild : function(id) {
        if(id && this._childrenIndex) {
            return this._childrenIndex[id];
        }
    },
    
    getChildAt : function(index) {
        if(this._children) {
            return this._children[index];
        }
    },
    
    removeChild : function() {},
    
    removeChildAt : function() {},
    
    removeChildren : function() {},
    
    forEachChild : function() {},
    
    indexOfChild : function() {},
    
    hasChild : function() {},
    
    getChildCount : function() {}
});

kampfer.UIComponent.generateUniqueId = function() {
    var guid = "";
    for(var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
            guid += "-";
        }
    }
    return guid;
};