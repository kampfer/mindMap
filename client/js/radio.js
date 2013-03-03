kampfer.require('events.EventTarget');
kampfer.require('mousetrap');
kampfer.require('mindMap.command');

kampfer.provide('mindMap.radio');
kampfer.provide('mindMap.Radio');

kampfer.mindMap.Radio = kampfer.events.EventTarget.extend({
    initializer : function() {
        //kampfer.mindMap.Radio.superClass.initializer.apply(this, arguments);

        for(var name in kampfer.mindMap.command) {
            var command = kampfer.mindMap.command[name];

            if(command.shortcut) {
                if(!this._shortcut2Command) {
                    this._shortcut2Command = {};
                }

                this._shortcut2Command[command.shortcut] = name;

                var that = this;
                mousetrap.bind(command.shortcut, function(event, shortcut) {
                    that._callCommand(shortcut);
                    return false;
                });
            }
        }
    },

    _shortcut2Command : null,

    _callCommand : function(shortcut) {
        if(shortcut in this._shortcut2Command) {
            var command = this._shortcut2Command[shortcut];
            kampfer.mindMap.radio.dispatch({
                type : 'executeCommand',
                command : command
            });
        }
    }
});

kampfer.mindMap.radio = new kampfer.mindMap.Radio();