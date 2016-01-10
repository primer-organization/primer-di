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

    test('define module', function(assert){
      var moduleFactoryCalled = false;
      def('m1', [], function(){
        moduleFactoryCalled = true;
        return {
          module: 'm1'
        };
      });
      assert.ok(moduleFactoryCalled);
    });

    test('define dependent module', function(assert){
      def('m2', [], function(assert){
        return {
          module: 'm2'
        };
      });
      var m3ModuleDefined = false;
      def('m3', ['m2'], function(m2){
        assert.ok(m2);
        assert.ok(m2.module === 'm2');
        m3ModuleDefined = true;
        return {
          module: 'm3'
        };
      });
      assert.ok(m3ModuleDefined);
    });

    test('define empty module', function(assert){
      var m4Defined = false;
      def('m4', [], function(){
        m4Defined = true;
        // not returning anything
      });
      assert.ok(m4Defined);
      var m5Defined = false;
      def('m5', ['m4'], function(m4){
        m5Defined = true;
        assert.ok(m4, 'm4 was not defined');
      });
      assert.ok(m5Defined);
    });

})();
