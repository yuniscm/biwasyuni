#!/usr/bin/env node

var fs = require('fs');
var biwasyuni = require('./biwasyuni_core.js');

var src = fs.readFileSync(process.argv[2], 'utf8');

biwasyuni.add_module("fs", fs);

biwasyuni.run(src, function(e){
    console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
});
