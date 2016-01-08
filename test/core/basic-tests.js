(function(){
    test('def available', function(){
        ok(def, 'di.js def is imported properly');
    });

    test('get dependency "utils:each"', function(){
        def('test dependency', ['utils:each'], function(each){
            ok(each, 'Got "each"');
        });
    });

    test('depend on unsatisfied dependency', function(){
        var depfn = function(){
            console.log('Dependency [' + this.name + '] initialized');
            return {name:this.name};
        };
        def('a1',['b1'],depfn);
        def('b1',['c1'],depfn);
        def('c1',[],depfn);
        expect(0);
    });

    test('circular dependency: simple 2-step', function(assert){
        def('a2', ['b2'], {});
        var err = undefined;
        try{
          def('b2', ['a2'], {});
        }catch(e){
          err = e;
        }
        
        assert.ok(err.message == 'Circular dependency detected for module: b2', 'Circular dependency was not detected');
    });

})();
