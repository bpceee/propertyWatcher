import { watchProperties } from './property_watcher';
import { watchGroup } from './property_watcher';

describe('scope property watcher utility,', function() {
  describe('watch on object primitive,', function() {
    it('called when registered', function() {
      var scope: any = {};
      scope.user = {title: 'a'};
      var counter = 0;
      watchProperties(scope, {
        user: {
          title: {
            __listener: (newValue: any) => {
              expect(newValue).toBe('a');
              counter++;
            }
          }
        }
      }); 
      expect(counter).toBe(1);
    });

    it('called when value changed', function() {
      var scope: any = {};
      scope.user = {title: 'a'};
      var counter = 0;
      watchProperties(scope, {
        user: {
          title: {
            __listener: (newValue: any, oldValue: any) => {
              if (counter === 1) {
                expect(oldValue).toBe('a');
                expect(newValue).toBe('b');
              }
              counter++;
            }
          }
        }
      }); 
      scope.user.title = 'b';
      expect(counter).toBe(2);
      scope.user.name = 'b';
      expect(counter).toBe(2);
    });

    it('called when outer object changed', function() {
      var scope: any = {};
      scope.user = {title: 'a'};
      var counter = 0;
      watchProperties(scope, {
        user: {
          title: {
            __listener: (newValue: any) => {
              if (counter > 0) {
                expect(newValue).toBe(undefined);
              }
              counter++;
            }
          }
        }
      }); 
      scope.user = {};
      expect(counter).toBe(2);
      scope.user = null;
      expect(counter).toBe(3);
    });
  });

  describe('watch on object', function() {
    it('called when object changed', function() {
      var scope: any = {};
      scope.user = {title: 'a'};
      var counter = 0;
      watchProperties(scope, {
        user: {
          title: {
            __listener: (newValue: any) => {
              counter++;
            }
          },
          __listener: (newValue: any) => {
            counter++;
          }
        }
      }); 
      expect(counter).toBe(2);
      scope.user = {};
      expect(counter).toBe(4);
      scope.user.title = 'b'; 
      expect(counter).toBe(5);
    });

    it('destroy watchers after called unwatch', function() {
      var scope: any = {};
      scope.user = {title: 'a'};
      var counter = 0;
      var listener = () => { counter++; };
      var unwatch: Function = watchProperties(scope, {
        user: {
          title: {
            __listener: listener
          },
          __listener: listener
        }
      }); 
      scope.user.title = 'b';
      expect(counter).toBe(3);
      scope.user = {};
      expect(counter).toBe(5);

      unwatch();
      scope.user = {};
      expect(counter).toBe(5);
      scope.user.title = 'c';
      expect(counter).toBe(5);
    });      
  });

  it('watch multiple times', function() {
    var scope: any = {};
    scope.user = {title: 'a'};
    var counter = 0;
    watchProperties(scope, {
      user: {
        title: {
          __listener: (newValue: any) => {
            counter++;
          }
        }
      }
    }); 
    expect(counter).toBe(1);
    
    watchProperties(scope, {
      user: {
        title: {
          __listener: (newValue: any) => {
            counter++;
          }
        }
      }
    }); 
    expect(counter).toBe(2);
    scope.user.title = 'b';
    expect(counter).toBe(4);
  });

  it('destroy watchers when obj changed', function() {
    var scope: any = {};
    scope.user = {title: 'a'};
    var counter = 0;
    watchProperties(scope, {
      user: {
        title: {
          __listener: (newValue: any) => {
            counter++;
          }
        }
      }
    }); 
    expect(counter).toBe(1);
    scope = {};
    scope.user = {title: 'a'};
    expect(counter).toBe(1);
  });  
  
  it('watchGroup', function() {
    var scope: any = {};
    var counter = 0;
    scope.a = {b: 'c'};
    scope.d = 'e';
    var unwatch = watchGroup(scope, ['a.b', 'd', 'a'], () => {
      counter++;
    });
    expect(counter).toBe(3);
    scope.d = 'f';
    expect(counter).toBe(4);
    scope.a.b = 'f';
    expect(counter).toBe(5);
    scope.a = {b: 'c'};
    expect(counter).toBe(7);
    scope.a.b = 'f';
    expect(counter).toBe(8);

    unwatch();
    scope.a.b = 'g';
    expect(counter).toBe(8);
    scope.a = {};
    expect(counter).toBe(8);
  });

});
