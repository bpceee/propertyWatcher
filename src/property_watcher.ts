/**
 * Utility function to watch object property changes
 * 
 * @param obj: the js object, cannot capture this obj change. watchers can only be destroyed when scope is destroyed
 * @param listenersDef: description for which property to watch and associated listnerFun
 * @example
 * var unwatch = watchProperties($scope, {
 *   user: {
 *     familyName: {__listener: update},
 *     givenName: {__listener: update},
 *     title: {__listener: update},
 *   }
 * });
 * unwatch();
 */
export function watchProperties(obj: any, listenersDef: any): Function {
  if (!obj) {
    resetListener(listenersDef);
    return () => { return; };
  }
  var unwatchArray: any = [];
  for (let key in listenersDef) {
    let innerListenerDef = listenersDef[key];
    let unwatch: Function;
    if (innerListenerDef.__listener) {
      var childrenCount = Object.keys(innerListenerDef).length;
      if (childrenCount === 1) {
      // 1. only __listener
        unwatch = watch(obj, key, innerListenerDef.__listener);
      } else {
      // 2. __listener && other listenerDef
        let innerUnwatch: Function;
        let outerUnwatch = watch(obj, key, (newValue: any) => {
          innerListenerDef.__listener(newValue);
          innerUnwatch = watchProperties(obj[key], innerListenerDef);
        });
        unwatch = () => {
          outerUnwatch();
          innerUnwatch();
        };
      }
    } else {
      // 3. no __listener
      unwatch = watch(obj, key, () => {
        watchProperties(obj[key], innerListenerDef);
      });
    }
    unwatchArray.push(unwatch);
  };
  return () => {
    unwatchArray.forEach((unwatch: any) => {
      unwatch();
    });
  };
}

export function watchGroup(obj: any, watchExpressions: any[], listener: (newValue: any, oldValue: any) => any): Function {
  var listenersDef: any = Object.create(null);
  watchExpressions.forEach((watchExpression) => {
    let watchExpressionKeys = watchExpression.split('.');
    let lastIndex = watchExpressionKeys.length - 1;
    let parentlistenersDef = listenersDef;
    watchExpressionKeys.forEach((key: string, index: number) => {
      if (typeof parentlistenersDef[key] === 'undefined') {
        parentlistenersDef[key] = Object.create(null);
      }     
      if (lastIndex === index) {
        parentlistenersDef[key].__listener = listener;
        return;
      }
      parentlistenersDef = parentlistenersDef[key];
    });
  });
  return watchProperties(obj, listenersDef);
}

function watch(obj: any, key: any, listenerFn: any): Function {
  if (!obj.__listenersMap) {
    obj.__listenersMap = {};
  }
  if (!obj.__listenersMap[key]) {
    obj.__listenersMap[key] = [];
  }  
  obj.__listenersMap[key].push(listenerFn);
  listenerFn(obj[key]);

  let value = obj[key];
  Object.defineProperty(obj, key, {
    configurable: true,
    get: () => value,
    set: (newValue) => {
      if (value === newValue) {
        return value;
      }
      let oldValue = value;
      value = newValue;
      obj.__listenersMap[key].forEach((listenerFn: any) => listenerFn(newValue, oldValue));
      return value;
    }
  });
  return () => {
    let index = obj.__listenersMap[key].indexOf(listenerFn);
    obj.__listenersMap[key].splice(index, 1);
  }; 
};

function resetListener(listenersDef: any) {
  for (let key in listenersDef) {
    let innerListenerDef = listenersDef[key];
    if (innerListenerDef.__listener) {
      innerListenerDef.__listener(undefined);
    } else {
      resetListener(innerListenerDef);
    }
  };
}