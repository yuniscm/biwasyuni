var fs = require('fs');
var biwasyuni = require('./biwasyuni_core.js');

var yuniroot = false;

var gen_filelist = function(yuniroot, loadpaths, entrypoints, cb){
    var biwaserror = function(e){
        console.error(e.stack ? e.stack : e.toString ? e.toString() : e);
        throw e;
    }
    var preloads = 
        ["lib-runtime/selfboot/biwascheme/selfboot-runtime.scm",
         "lib-runtime/selfboot/common/common.scm",
         "lib-runtime/selfboot/biwascheme/run-genfilelist.scm"];

    biwasyuni.add_module("fs", fs);
    biwasyuni.set_current_fs(fs);
    biwasyuni.add_module("yuniroot", yuniroot);
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

module.exports = {
    gen_filelist:gen_filelist

};
