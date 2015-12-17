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
 * Primer DI core file. This is the dependency injection/management module.
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
            if(collection.hasOwnProperty(k)){
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
    context[name] = context[name] || {};
    var module = {
        ref: moduleDefinition,
        name: name,
        resolved: false,
        dependants:context[name].dependants || {},
        available: function(){
            console.log('Module [', name, '] has just become available. Dependent module will be notified: ', this.dependants);
            utils.each(this.dependants, function(dep){
                console.log('  -> Notifying ', dep,' to check if satisfied...');
                dep.checkDependencies();
            }, this);
            console.log('All dependant modules have been notified.');
        },
        initializeModule: function(resolvedDependencies){
            console.log('Initializing module ', name);
            var module = undefined;
            if(typeof(moduleDefinition) == 'function'){
                module = moduleDefinition.apply(this, resolvedDependencies);
            }else{
                module = moduleDefinition; // or maybe we use this as a config ?
            }
            this.ref = module;
            this.resolved = true;
            console.log('Module [', name, '] initialized and available.');
        },
        checkDependencies: function(){
            var allSatisfied = true;
            var resolved = [];
            console.log('Checking dependencies on module: ', name);
            utils.each(dependencies, function(dep){
                console.log('  -> checking: ', dep);
                if(!context[dep]){
                    context[dep] = {resolved: false, dependants: {}}; // awaiting to be resolved
                    console.log('  -> dependency not yet present');
                }
                if( !context[dep].resolved ){
                    allSatisfied = false;
                }
                resolved.push(context[dep].ref);
                context[dep].dependants[name] = module;
            }, this);
            if(allSatisfied){
                console.log('  -> All dependencies available => ', resolved);
                this.initializeModule(resolved);
                this.available();
            }
        }
    };
    context[name] = module;
    module.checkDependencies();
};

var _root = {};

var def = function(name, dependencies, moduleDefinition){
    _def(_root, name, dependencies, moduleDefinition);
};

def('utils:ext',[], function(){ return utils.ext; });
def('utils:each',[], function(){ return utils.each; });


window.def = def; // FIXME: I don't like the name
})();
