#!/usr/bin/env node

var fs = require('fs');
var biwasyuni = require('./biwasyuni_node.js').biwasyuni;

var src = fs.readFileSync(process.argv[2], 'utf8');

biwasyuni.add_module("fs", fs);
biwasyuni.set_current_fs(fs);

biwasyuni.run(src, function(res){}, function(e){
    console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
    process.exit(1);
});
