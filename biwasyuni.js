#!/usr/bin/env node

var biwas = require('./node_modules/biwascheme');
var fs = require('fs'); // Also used for (override) load
// FIXME: Embed yuni runtime later.
var src = fs.readFileSync(process.argv[2], 'utf8');

var libs = {
    "biwascheme":biwas
};

biwas.define_libfunc("yuni/js-import", 1, 1, function(ar){
    return libs[ar[0]];
});


biwas.define_libfunc("load", 1, 1, function(ar){
    // Override: (load fn)
    // NB: Override load because we may return a Pause on load'ed code.
    // FIXME: Parhaps it's same for scheme-eval...
    var pth = ar[0];
    var src = fs.readFileSync(pth, "utf8"); // FIXME: Make this async.
    return new biwas.Pause(function(pause){
        var interp2 = new biwas.Interpreter(interp, pause.resume);
        interp2.evaluate(src);
    });
});

biwas.define_libfunc("yuni/js-invoke/async", 2, null, function(ar){
    var js_obj = ar.shift();
    var func_name = ar.shift();
    return new biwas.Pause(function(pause){
        ar.push(function(){ pause.resume([].slice.call(arguments)); });
        js_obj[func_name].apply(js_obj, ar);
    });
});

var interp = new biwas.Interpreter(function(e){
    console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
});

interp.evaluate(src);
