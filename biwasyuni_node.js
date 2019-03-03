var fs = require('fs');
var path = require('path');
var biwasyuni = require('./biwasyuni_core.js');

var yuniroot = false;

var gen_filelist = function(yuniroot, loadpaths, entrypoints, cb){
    var biwaserror = function(e){
        console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
        throw e;
    }
    var preloads = 
        ["lib-runtime/selfboot/biwascheme/selfboot-yunipkg.scm",
         "lib-runtime/selfboot/biwascheme/run-genfilelist.scm"];

    // Slashfy yuniroot
    yuniroot = yuniroot.split(path.sep).join("/");
    biwasyuni.add_module("fs", fs);
    biwasyuni.set_current_fs(fs);
    biwasyuni.add_module("yuniroot", yuniroot);
    biwasyuni.add_module("biwasyuni-load-runtime-only", true);
    biwasyuni.add_module("entrypoints", entrypoints);
    if(loadpaths){
        biwasyuni.add_module("loadpaths", loadpaths);
    }else{
        biwasyuni.add_module("loadpaths", []);
    }

    // Generate script
    var script = preloads.map(e => "(load \"" + yuniroot + "/" + e + "\")\n").join("\n");

    biwasyuni.run(script, cb, biwaserror);
}

biwasyuni.activate_node_functions(require("fs"),
                                  require("path"),
                                  process);

// FIXME: Using web-level console; implement full console later..
biwasyuni.switch_console_output();

module.exports = {
    gen_filelist:gen_filelist,
    biwasyuni:biwasyuni
};
