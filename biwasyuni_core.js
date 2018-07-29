var biwas = require('./node_modules/biwascheme');

var current_fs = false;

var libs = {
    "biwascheme":biwas
};

biwas.define_libfunc("yuni/js-import", 1, 1, function(ar){
    return libs[ar[0]];
});

var add_module = function(name, obj){
    libs[name] = obj;
};

var set_current_fs = function(obj){
    current_fs = obj;
};

biwas.define_libfunc("load", 1, 1, function(ar){
    // Override: (load fn)
    // NB: Override load because we may return a Pause on load'ed code.
    // FIXME: Parhaps it's same for scheme-eval...
    var pth = ar[0];
    return new biwas.Pause(function(pause){
        current_fs.readFile(pth, 'utf8', function(err, src){
            if(err){
                throw new biwas.Error("load: read error");
            }else{
                var interp2 = new biwas.Interpreter(this.on_error);
                interp2.evaluate(src, function(obj){pause.resume(obj);});
            }
        });
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
    },
    // Yuni addition
    get_bytes_at: function(bv, at, len){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.read(fd, bv, at, len, null, function(err, readbytes, buf){
                if(err){
                    throw new biwas.Error("Read: error");
                }else{
                    pause.resume(readbytes);
                }
            });
        });
    },
    get_bytes_all: function(){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.readFile(fd, function(err, bv){
                if(err){
                    throw new biwas.Error("Read: error");
                }else{
                    pause.resume(bv);
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
    },
    // Yuni addition
    put_uint8array: function(bv){
        var fs = this.fs;
        var fd = this.fd;
        return new biwas.Pause(function(pause){
            fs.write(fd, bv, function(err){
                if(err){
                    throw new biwas.Error("WriteFile: write error");
                }else{
                    pause.resume(biwas.undef);
                }
            });
        });
    }
});

biwas.Port.YuniBufferBinaryInput = biwas.Class.extend(new biwas.Port(true, false), {
    initialize: function(bv){
        this.is_binary = true;
        this.bv = bv;
        this.current_position = 0;
    },
    get_string: function(after){
        return after(String.fromCharCode.apply(null, bv.subarray(this.current_position, this.bv.length)));
    },
    close: function(){},
    // Yuni addition
    get_bytes_at: function(bv, at, len){
        var cur = this.current_position;
        var req = len;
        if(cur + len > this.bv.length){
            req = this.bv.length - cur;
        }
        this.current_position += req;
        bv.set(this.bv.subarray(cur, cur + req), at);
        return req == 0 ? biwas.eof : req;
    },
    get_bytes_all: function(){
        var cur = this.current_position;
        this.current_position = this.bv.length;
        return bv.subarray(cur, this.bv.length);
    }
});

biwas.Port.YuniBufferBinaryOutput = biwas.Class.extend(new biwas.Port(false, true), {
    initialize: function(){
        this.bv = false;
        this.is_binary = true;
    },
    put_string: function(str){
        var bv = new Uint8Array([].map.call(str, function(c){return c.charCodeAt(0);}));
        return this.put_uint8array(bv);
    },
    close: function(){},
    // Yuni addition
    put_uint8array: function(bv){
        if(this.bv){
            var curlen = this.bv.length;
            var nexlen = curlen + bv.length;
            var newbv = new Uint8Array(nexlen);
            newbv.set(this.bv, 0);
            newbv.set(bv, curlen);
            this.bv = newbv;
        }else{
            this.bv = bv;
        }
        return biwas.undef;
    },
    get_uint8array: function(){
        var bv = this.bv;
        this.bv = null;
        return bv;
    }
});

// R7RS ports additions
biwas.define_libfunc("write-string", 1, null, function(ar){
    var str = ar[0];
    var port = ar[1] ? ar[1] : Port.current_output;
    var start = ar[2] ? ar[2] : 0;
    var end = ar[3] ? ar[3] : str.length;

    return port.put_string(str.substring(start,end));
});
biwas.define_libfunc("write-bytevector", 1, null, function(ar){
    var bv = ar[0];
    var port = ar[1] ? ar[1] : Port.current_output;
    var start = ar[2] ? ar[2] : 0;
    var end = ar[3] ? ar[3] : bv.length;

    return port.put_uint8array(bv.subarray(start,end));
});
biwas.define_libfunc("read-bytevector!", 1, 4, function(ar){
    var bv = ar[0];
    var port = ar[1] ? ar[1] : Port.current_input;
    var start = ar[2] ? ar[2] : 0;
    var end = ar[3] ? ar[3] : bv.length;

    return port.get_bytes_at(bv, start, end - start);
});

biwas.define_libfunc("open-output-bytevector", 0, 0, function(ar){
    return new biwas.Port.YuniBufferBinaryOutput();
});
biwas.define_libfunc("get-output-bytevector", 1, 1, function(ar){
    return ar[0].get_uint8array();
});
biwas.define_libfunc("open-input-bytevector", 1, 1, function(ar){
    return new biwas.Port.YuniBufferBinaryInput(ar[0]);
});

// R7RS bytevectors
biwas.define_libfunc("bytevector", 0, null, function(ar){
    return Uint8Array.from(ar);
});
biwas.define_libfunc("make-bytevector", 1, 2, function(ar){
    var k = ar[0];
    var b = ar[1] ? ar[1] : 0;
    var bv = new Uint8Array(k);
    if(b != 0){
        bv.fill(b);
    }
    return bv;
});
biwas.define_libfunc("r6:bytevector-copy", 1, 1, function(ar){
    return new Uint8Array(ar[0]);
});
biwas.define_libfunc("r6:bytevector-copy!", 5, 5, function(ar){
    var from = ar[0];
    var start = ar[1];
    var to = ar[2];
    var at = ar[3];
    var len = ar[4];
    if(from === to){ /* copyWithin */
        to.copyWithin(at, start, start + len);
    }else{
        to.set(from.subarray(start, start + len),at);
    }
    return biwas.undef;
});
biwas.define_libfunc("bytevector-length", 1, 1, function(ar){
    return ar[0].length;
});
biwas.define_libfunc("bytevector-append", 0, null, function(ar){
    var totallen = ar.reduce(function(acc, cur){ return acc + ar.length; }, 0);
    var bv = new Uint8Array(totallen);
    var cur = 0;
    ar.forEach(function(b){bv.set(b, cur); cur += b.length;});
    return bv;
});
biwas.define_libfunc("r6:utf8->string", 1, 1, function(ar){
    // FIXME: Implement this
    return String.fromCharCode.apply(null, ar[0]);
});
biwas.define_libfunc("r6:string->utf8", 1, 1, function(ar){
    // FIXME: Implement this
    return new Uint8Array([].map.call(ar[0], function(c){return c.charCodeAt(0);}));
});
biwas.define_libfunc("bytevector-u8-ref", 2, 2, function(ar){
    return ar[0][ar[1]];
});
biwas.define_libfunc("bytevector-u8-set!", 3, 3, function(ar){
    return ar[0][ar[1]] = ar[2];
});

// R6RS aliases for R7RS overrides
biwas.alias_libfunc("string->list", "r6:string->list");
biwas.alias_libfunc("string-copy", "r6:string-copy");
biwas.alias_libfunc("vector-copy", "r6:vector-copy");
biwas.alias_libfunc("vector-fill!", "r6:vector-fill!");

var run = function(src, errhandler){
    var interp = new biwas.Interpreter(errhandler);
    interp.evaluate(src);
};

module.exports = {
    run:run,
    add_module:add_module,
    set_current_fs:set_current_fs
};
