kampfer.provide('mindMap.command.stack');
kampfer.provide('mindMap.command.Redo');
kampfer.provide('mindMap.command.Undo');

kampfer.mindMap.command.stack = {
    queue : [],

    index : 0,

    push : function(command) {
        this.queue.push(command);
        this.index++;
    },

    pop : function() {
        return this.queue.pop();
    },

    getLength : function() {
        return this.queue.length;
    }
};


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
    execute : function(level) {
        var kmcs = kampfer.mindMap.command.stack;
        level = level || this.level;
        for(var i = 0; i < this.level; i++) {
            if(kmcs.index > 0) {
                var command = kmcs.queue[--kmcs.index];
                command.unExecute();
            } else {
                return;
            }
        }

        document.title = this.mapManager.getMapName() + '*';
    },

    level : 1
});

kampfer.mindMap.command.Undo.isAvailable : function() {
    if(kampfer.mindMap.command.index <= 0) {
        return false;
    }
    return true;
};


kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
    execute : function() {
        if( !this.isAvailable() ) {
            return;
        }
        var kmc = kampfer.mindMap.command;
        for(var i = 0; i < this.level; i++) {
            if(kmc.index <kmc.commandList.length) {
                var command = kmc.commandList[kmc.index++];
                command.execute();
            } else {
                return;
            }
        }

        document.title = this.mapManager.getMapName() + '*';
    },

    level : 1,

    isAvailable : function() {
        if( kampfer.mindMap.command.index >=
            kampfer.mindMap.command.commandList.length ) {
            return false;
        }
        return true;
    }
});