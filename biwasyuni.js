#!/usr/bin/env node

var biwas = require('./node_modules/biwascheme');
var fs = require('fs');
// FIXME: Embed yuni runtime later.
var src = fs.readFileSync(process.argv[2], 'utf8');

biwas.run(src);

