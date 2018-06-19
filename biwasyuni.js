#!/usr/bin/env node

var biwas = require('./node_modules/biwascheme');
var fs = require('fs');
// FIXME: Embed yuni runtime later.
var src = fs.readFileSync(process.argv[2], 'utf8');

var libs = {
    "biwascheme":biwas
};

biwas.define_libfunc("yuni/js-import", 1, 1, function(ar){
    return libs[ar[0]];
});

biwas.run(src);
