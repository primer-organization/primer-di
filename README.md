primer-di
=====

<b>primer-di</b> is a dependency injection and dependency management framework for
JavaScript.
The main goal of <b>primer-di</b> is to provide dependency injection to your application, nothing more and nothing less.
It tends to be simple, small, fast and easy.

Use it in your project
----------------------

If you've downloaded the project locally, you can just insert it to your HTML
document like so:

```html
<script type="text/javascript" src="<path_to_primer-di>/src/core.js"></script>
```
With bower:

```bash
bower install primer-di --save
```
Then include it to your project:

```html
<script type="text/javascript" src="bower_components/primer-di/src/core.js"></script>
```


Define some modules
--------

Once you have installed primer-di, you can start writing some modules for your project.

Write your first module:

```javascript
def('myFirstModule', function(){
  console.log("Hello! I've just defined my first module!");
});
```

Now let's define some more module, dependent on each other. Let's say we have some
services that we want to use. We can write a module:

```javascript
def('userServices', function(){
  // This is our module factory. It gets called the first time another module
  // requests 'userServices' as a dependency.
  // The factory builds and returns the module. Later on, the module will be
  // injected by primer-di whenever is requested.

  var userProfile = {
    name: 'Marian Myers',
    email: 'marian.myers21@example.com'
  };

  return {
    getUserProfile: function(){
      return userProfile;
    },
    updateUserProfile: function(name, email){
      userProfile.name = name;
      userProfile.email = email;
    }
  };
});
```

We can now use ```userServices``` module in different modules of our app:

```javascript
// in a UI read only user card
def('uiUserCard', ['userServices'], function(userServices){
    // userServices will be automatically injected here
    var profile = userServices.getUserProfile();
    $('#user-name').text(profile.name);
    $('#user-email').text(profile.email);
});

// In an update form
def('uiProfileUpdate', ['userServices'], function(userServices){
  // userServices will be automatically injected here as well
  $('button#update-profile', function(){
      var userName = $('#user-name-input').val();
      var email = $('#user-email-input').val();
      userServices.updateUserProfile(userName, email);
  });

});

```




A bit more about ```def```
--------------------------

The main API exposed by **primer-di** is the function ```def``` (aliased as ```define```).
The main syntax of the function is:

```javascript
def([module_name], [dependencies], module_factory | module_definition)
```

This defines a module with name ```module_name```, optional Array of dependencies using
the ```module_factory``` to build the module or the module definition itself (if the third
argument is an object).

Arguments:

* ```module_name``` - type:```string``` _(optional)_ - The name of the module. This is an optional argument,
and if not supplied the module is considered to be anonymous (see bellow for the exact syntax on this).
If given, the module may be referenced later on by other module by specifying the name in the dependency
Array when defining the other module - for example: if we define a module **A**:

  ```javascript
  def('A', function(){
    return {};
  });
  ```

  we can inject it later on by its name into other module like so:

  ```javascript
  def('B', ['A'], function(A){
    // A will be automatically injected.  
  });
  ```
* ```dependencies``` - type:```Array``` _(optional)_  - an Array of dependencies to be injected in the module.
 The dependencies array contains the names of the modules on which the current module depends on.
 If this argument is omitted or an empty array is provided, primer-di considers that the module has no dependencies
 and builds it immediately.

 There is no restriction on the number of dependencies per module.

* ```module_factory``` - type:```function``` - the factory that builds the module. The factory function will be called
 and executed to build the module itself. Once all the dependencies have been resolved and are available for injection,
 the factory will be called with the dependencies values in the same order in which they were requested. If no
 dependencies were requested, then the factory will be called without any arguments.

 The return value of the factory is the build module. If nothing is returned (or values ```undefined``` or ```null```), then
 the module is considered to be an _empty_ module.

 There is an option to **NOT** use the module factory approach, but to define the module directly without a factory. This is possible
 if you provide an ```Object``` instead of ```function``` as the module definition (```module_factory``` argument). In this case,
 whenever all dependencies become available, the module will be registered and will become available.

API usage examples
------------------

1. Define a named module (without dependencies) - the most basic example:

  ```javascript
  def('my-module', function(){
    // module factory
    var myModule = {
      name: 'MyModule',
      someAction: function(){}
    };
    // return the actual module definition
    return myModule;
  });
  ```

2. Define a named module with dependencies:

  ```javascript
  def('my-module', ['mod1', 'mod2', 'mod3'], function(mod1, mod2, mod3){
    // module factory
    // called when all dependencies 'mod1', 'mod2' and 'mod3' become available
    // and are automatically injected as arguments to this factory function
    var myModule = {
      name: 'MyModule',
      someAction: function(){}
    };
    // return the actual module definition
    return myModule;
  });
  ```
3. Define an anonymous module with dependencies:

  ```javascript
  def(['mod1', 'mod2', 'mod3'], function(mod1, mod2, mod3){
    // module factory
    // called when all dependencies 'mod1', 'mod2' and 'mod3' become available
    // and are automatically injected as arguments to this factory function

    // Perform any operations with the dependencies. The return value is irrelevant
    // here, because this is an anonymous module and as such will be impossible to
    // retrieve it later.
  });
  ```



Order of building the defined modules
-------------------------------------

**primer-di** executes the modules factories asynchronously. This means that the order is which
the modules are defined is irrelevant. **primer-di** builds each module as its dependencies
are resolved - a module factory will be called and executed as soon as **all** of its dependencies
have been resolved.

Let's see some examples.

If we have the modules **A**, **B** and **C** defined like this:
```javascript
def('A', function(){
  console.log('A was defined');
});

def('B', ['A'], function(){
  console.log('B was defined');
});

def('C', ['A', 'B'], function(){
  console.log('C was defined');
});

```

we can expect to have the following output:
```
A was defined.
B was defined.
C was defined.
```

Now, let us try to mix them up:

```javascript

def('B', ['A'], function(){
  console.log('B was defined');
});

def('C', ['A', 'B'], function(){
  console.log('C was defined');
});

def('A', function(){
  console.log('A was defined');
});

```

we would still get the same output, although the modules are not defined in the same order:
```
A was defined.
B was defined.
C was defined.
```

If we investigate what happens, we can see that:
* First we define the module **B**, it depends on **A** which is not yet available. At this point nothing gets executed.
* Then we define the module **C**. This module depends on both **A** and **B**, none of which is available yet. Still, nothing happens.
* Then we define the module **A**. **A** doesn't depend on anything, so it is immediately called. The console logs ```A was defined.```.
* Then, **primer-di** marks that **A** was defined proceeds to initialize and build **B** which depends only on **A**. When the factory for **B** is
called, the console logs: ```B was defined.```. **primer-di** marks **B** as available as well.
* Then, **primer-di** proceeds to initialize and build **C** for which both dependencies (**A** and **B**) have been resolved. It executes the
factory method and logs ```C was defined.```



License
--------
Lincensed under Apache 2.0 license.
