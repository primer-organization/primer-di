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

```
<script type="text/javascript" src="<path_to_primer-di>/src/core.js"></script>
```
With bower:

```
bower install primer-di --save
```
Then include it to your project:

```
<script type="text/javascript" src="bower_components/primer-di/src/core.js"></script>
```


Define some modules
--------

Once you have installed primer-di, you can start writing some modules for your project.

Write your first module:

```
def('myFirstModule', function(){
  console.log("Hello! I've just defined my first module!");
});
```

Now let's define some more module, dependent on each other. Let's say we have some
services that we want to use. We can write a module:

```
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

```
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

```def``` (aliased as ```define```) is the main API exposed by **primer-di**.
The main syntax of the function is:

```
def(module_name, [dependencies], module_factory | module_definition)
```

This defines a module with name ```module_name```, optional Array of dependencies using
the ```module_factory``` to build the module or the module definition itself (if the third
argument is an object).

Arguments:

* ```module_name``` - type ```string``` - The name of the module. This is an optional argument, and if not supplied the module is considered to be anonymous (see bellow for the exact syntax on this). If given, the module may be referenced later on by other module by specifying the name in the dependency Array when defining the other module - for example: if we define a module **A**:
```
def('A', function(){
  return {};
});
```

we can inject it later on by its name into other module like so:

```
def('B', ['A'], function(A){
  // A will be automatically injected.  
});
```

helpers
------


License
--------
Lincensed under Apache 2.0 license.
