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
        def('a',['b'],depfn);
        def('b',['c'],depfn);
        def('c',[],depfn);
        expect(0);
    });
    
    test('circular dependency: simple 2-step', function(){
        def('a', ['b'], {});
        def('b', ['a'], {});
        expect(0);
    });
    
})();
