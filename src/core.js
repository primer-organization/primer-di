/*
    Copyright 2013 Pavle Jonoski

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


/**
 * DI.js core file. This is the dependency injection/management module.
 */
(function(){

var diContext = {
    modules: {}
};

var utils = {
    ext: function(){},
    each: function(collection, callback, scope){
        var i = 0;
        for(var k in collection){
            if(collection.hasOwnPropery(k)){
                if(callback.call(scope || window, collection[k], k, i) === false){
                    break;
                }
                i++;
            }
        }
    }
};

var _def = function(context, name, dependencies, moduleDefinition){
    if(context[name]){
        // well... nothing for now
    }
    var module = {
        ref: moduleDefinition,
        resolved: false,
        dependants:{}
        available: function(){
            //utils.each(this.dependants, fun);
        }
    };
    context[name] = module;
    var deps = {};
    var allResolved = true;
    utils.each(dependencies, function(dep){
        deps[dep] = {
            resolved = false;
        };
        if(!context[dep] || !context[dep].resolved){
            allResolved = false;
            deps[dep] = context[dep];
        }
        context[dep].dependants[name] = module;
    });
    if(allResolved){
        var args = [];
        utils.each(dependencies, function(dep){
            args.push(context[dep].ref);
        });
        context[name].ref = context[name].ref.apply(this, args);
        context[name].resolved = true;
        context[name].available();
    }
};

var _root = {};

var def = function(name, dependencies, moduleDefinition){
    _def(_root, name, dependencies, moduleDefinition);
};

def('utils:ext',[], function(){ return utils.ext; });
def('utils:each',[], function(){ return utils.each; });
})();
