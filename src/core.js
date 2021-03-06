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
    if(context[name] && context[name].defined){
        console.warn('The definition of module ', name, 'overrides an exiting module definition.');
    }
    context[name] = context[name] || {};
    var module = {
        ref: moduleDefinition,
        name: name,
        resolved: false,
        defined: true,
        dependants:context[name].dependants || {},
        available: function(){
            utils.each(this.dependants, function(dep){
                dep.checkDependencies();
            }, this);
        },
        initializeModule: function(resolvedDependencies){
            var module = undefined;
            if(typeof(moduleDefinition) == 'function'){
                module = moduleDefinition.apply(this, resolvedDependencies);
                if(module === undefined || module === null){
                  module = {};
                }
            }else{
                module = moduleDefinition; // or maybe we use this as a config ?
            }
            this.ref = module;
            this.resolved = true;
            //console.log('Module [', name, '] is available.');
        },
        checkDependencies: function(){
            var allSatisfied = true;
            var resolved = [];
            if(this.hasDependencyOn(name)){
              throw new Error('Circular dependency detected for module: ' + name);
            }
            utils.each(dependencies, function(dep){
                if(!context[dep]){
                    context[dep] = {resolved: false, dependants: {}}; // awaiting to be resolved
                }
                if( !context[dep].resolved ){
                    allSatisfied = false;
                }
                resolved.push(context[dep].ref);
                context[dep].dependants[name] = module;
            }, this);
            if(allSatisfied){
                this.initializeModule(resolved);
                this.available();
            }
        },
        hasDependencyOn: function(moduleName){
          for(var i = 0; i < dependencies.length; i++){
            var depName = dependencies[i];
            if ( depName === moduleName){
              return true;
            }else{
              if(context[depName] &&
                  context[depName].hasDependencyOn &&
                  context[depName].hasDependencyOn(moduleName)){
                return true;
              }
            }
          }
          return false;
        }
    };
    context[name] = module;
    module.checkDependencies();
};

var _root = {};
var _anonModules = {
  seq: 0,
  nextName: function(){
    return '::__anonimous__::' + (_anonModules.seq++);
  }
};

var def = function(){
  if(!arguments.length){
    throw new Error('Invalid API usage. You must specify the module factory at least.');
  }
  if(arguments.length == 1){
    if(typeof(arguments[0]) === 'function'){
      _def(_root, _anonModules.nextName(), [], arguments[0]);
    }else{
      throw new Error('You can only define an anonymous module factory without dependencies.');
    }
  }else if(arguments.length == 2){
    var moduleName = undefined;
    var dependencies = undefined;
    var moduleDef = undefined;

    if(Array.isArray(arguments[0])){
      moduleName = _anonModules.nextName();
      dependencies = arguments[0];
      moduleDef = arguments[1];
    }else if(typeof(arguments[0]) == 'string'){
      moduleName = arguments[0];
      dependencies = [];
      moduleDef = arguments[1];
    }else{
      throw new Error('Invalid API usage. You can either define an anonymous module with dependencies, or a module with an explicit name.');
    }
    _def(_root, moduleName, dependencies, moduleDef);
  }else if(arguments.length == 3){
    _def(_root, arguments[0], arguments[1], arguments[2]);
  }else{
    throw new Error('Invalid API usage. Too many arguments.');
  }
};


def('utils:each',[], function(){ return utils.each; });


window.def = def;
window.define = def;
})();
