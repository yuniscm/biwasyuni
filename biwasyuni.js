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
        var interp2 = new biwas.Interpreter(interp, this.on_error);
        interp2.evaluate(src, pause.resume);
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

biwas.Port.YuniFileInput = biwas.Class.extend(new biwas.Port(true, false), {
    initialize: function(fs, fd){
        this.fs = fs;
        this.fd = fd;
    },
    get_string: function(after){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.readFile(fd, 'utf8', function(err, data){
                if(err){
                    throw new biwas.Error("ReadFile: read error");
                }else{
                    pause.resume(after(data));
                }
            });
        });
    },
    close: function(){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.close(fd, function(err){
                if(err){
                    throw new biwas.Error("Close: error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    }
});

biwas.Port.YuniFileOutput = biwas.Class.extend(new biwas.Port(false, true), {
    initialize: function(fs, fd){
        this.fs = fs;
        this.fd = fd;
    },
    put_string: function(str){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.writeFile(fd, str, 'utf8', function(err){
                if(err){
                    throw new biwas.Error("WriteFile: write error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    },
    close: function(){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.close(fd, function(err){
                if(err){
                    throw new biwas.Error("Close: error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    }
});

biwas.Port.YuniFileBinaryInput = biwas.Class.extend(new biwas.Port(true, false), {
    initialize: function(fs, fd){
        this.fs = fs;
        this.fd = fd;
        this.is_binary = true;
    },
    get_string: function(after){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.readFile(fd, 'utf8', function(err, data){
                if(err){
                    throw new biwas.Error("ReadFile: read error");
                }else{
                    pause.resume(after(data));
                }
            });
        });
    },
    close: function(){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.close(fd, function(err){
                if(err){
                    throw new biwas.Error("Close: error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    }
});

biwas.Port.YuniFileBinaryOutput = biwas.Class.extend(new biwas.Port(false, true), {
    initialize: function(fs, fd){
        this.fs = fs;
        this.fd = fd;
        this.is_binary = true;
    },
    put_string: function(str){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.writeFile(fd, str, 'utf8', function(err){
                if(err){
                    throw new biwas.Error("WriteFile: write error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    },
    close: function(){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.close(fd, function(err){
                if(err){
                    throw new biwas.Error("Close: error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    }
});

var interp = new biwas.Interpreter(function(e){
    console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
});

interp.evaluate(src);
