// This file holds code to hande the FHIRPath Existence functions (5.1 in the
// specification).

var util = require("./utilities");

/**
 *  Adds the existence functions to the given FHIRPath engine.
 */
function engineBuilder(engine) {
  engine.emptyFn = function(x) {
    if(x){
      return [x.length == 0];
    } else {
      if(engine.isSome(x)){
        return [false];
      } else {
        return [true];
      }
    }
  };

  engine.notFn = function(x) {
    return (x.length === 1 && typeof x[0] === 'boolean') ? [!x[0]] : [];
  }

  engine.existsMacro  = function(ctx, parentData, node) {
    let col = parentData;
    if (node.length && node[0].children && node[0].children.length) {
      // Then there is a criteria.  Use the result of where.
      col = engine.whereMacro(ctx, parentData, node);
    }
    return [engine.isSome(col)];
  };

  engine.allMacro = function(ctx, parentData, node) {
    var lambda = node[0].children[0];

    let rtn = true;
    console.log(parentData.length);
    for (let i=0, len=parentData.length; i<len && rtn; ++i) {
      let parent = parentData[i];
      let parentResult = (engine.doEval(ctx, [parent], lambda));
      rtn = parentResult.length === 1 && parentResult[0] === true;
    }
    return [rtn];
  }

  engine.allTrueFn  = function(x) {
    let rtn = true;
    for (let i=0, len=x.length; i<len && rtn; ++i) {
      util.assertType(x[i], ["boolean"], "allTrue");
      rtn = x[i] === true;
    }
    return [rtn];
  };

  engine.anyTrueFn  = function(x) {
    let rtn = false;
    for (let i=0, len=x.length; i<len && !rtn; ++i) {
      util.assertType(x[i], ["boolean"], "anyTrue");
      rtn = x[i] === true;
    }
    return [rtn];
  };

  engine.allFalseFn  = function(x) {
    let rtn = true;
    for (let i=0, len=x.length; i<len && rtn; ++i) {
      util.assertType(x[i], ["boolean"], "allFalse");
      rtn = x[i] === false;
    }
    return [rtn];
  };

  engine.anyFalseFn  = function(x) {
    let rtn = false;
    for (let i=0, len=x.length; i<len && !rtn; ++i) {
      util.assertType(x[i], ["boolean"], "anyFalse");
      rtn = x[i] === false;
    }
    return [rtn];
  };

  var fnTable = engine.fnTable;
  var existenceFns = ["empty", "not", "allTrue", "anyTrue",
    'allFalse', 'anyFalse'];
  for (let i=0, len=existenceFns.length; i<len; ++i) {
    let name=existenceFns[i];
    fnTable[name] = engine[name+"Fn"];
  }

  engine.macroTable.exists = engine.existsMacro;
  engine.macroTable.all = engine.allMacro;
}

module.exports = engineBuilder;