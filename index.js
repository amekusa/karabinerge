/*!
 *  karabinerge
 * ------------- ---- -  *
 *  Karabiner Elements complex modifications generator
 *  @author Satoshi Soma (https://amekusa.com)
 * ==================================================== *
 *
 *  MIT License
 *
 *  Copyright (c) 2022 Satoshi Soma
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

class Sanitizer {
  constructor() {
    this.filters = [];
  }
  addFilter(q, fn) {
    this.filters.push({ q: arr(q), fn });
    return this;
  }
  sanitize(obj) {
    for (let f of this.filters) {
      for (let q of f.q) dig(obj, q, { mutate: found => f.fn(found) });
    }
    return obj;
  }
}

class RuleSet {
  constructor(title) {
    this.title = title;
    this.rules = [];
  }
  add(...args) {
    let rule = new Rule(...args);
    this.rules.push(rule);
    return rule;
  }
  toJSON() {
    return {
      title: this.title,
      rules: this.rules.map(item => item.toJSON())
    };
  }
  out() {
    console.log(JSON.stringify(this, null, 2));
  }
}

class Rule {
  constructor(desc) {
    this.desc = desc;
    this.remaps = [];
    this.conds = [];
  }
  remap(map) {
    if (!map.type) map = { type: 'basic', ...map };
    if (this.conds.length) map = Object.assign(map, { conditions: this.conds });
    this.remaps.push(remapSanitizer.sanitize(map));
    return this;
  }
  cond(cond) {
    this.conds.push(cond);
    return this;
  }
  toJSON() {
    return {
      description: this.desc,
      manipulators: this.remaps
    };
  }
}

const remapSanitizer = new Sanitizer()
  .addFilter('from.modifiers', prop => {
    switch (typeof prop) {
    case 'string':
      return { mandatory: [prop] };
    case 'object':
      if (Array.isArray(prop)) return { mandatory: prop };
    }
    return prop;
  })
  .addFilter([
    'from.modifiers.mandatory',
    'from.modifiers.optional',
    'to',
    'to[].modifiers',
    'to_if_alone',
    'to_if_held_down',
    'to_after_key_up',
    'to_delayed_action.to_if_invoked',
    'to_delayed_action.to_if_canceled'
  ], prop => {
    return arr(prop)
  });

/**
 * @param {object} obj - Object
 * @param {string|string[]} q - Query
 * @param {object|boolean} [opts] - Options
 *   @param {any} [opts.assign] - Value to assign to the end property if it doesn't exist
 *   @param {function} [opts.forEach]
 *   @param {function} [opts.makePath]
 *   @param {function} [opts.mutate]
 * @return {any|object} Value of the found property, or mutated `opts`
 * @author amekusa.com
 */
function dig(obj, q, opts = undefined) {
  q = Array.isArray(q) ? q : q.split('.');
  if (opts) {
    if (typeof opts == 'boolean') opts = {};
    opts.query = q;
    opts.path = [obj];
  }
  for (let i = 0;; i++) {
    let iQ = q[i];

    // array query
    if (iQ.endsWith('[]')) {
      iQ = iQ.substring(0, iQ.length - 2);
      if (iQ in obj) {
        if (!Array.isArray(obj[iQ])) return undefined;
        let qRest = q.slice(i + 1);
        if (opts) {
          let results = [];
          for (let j = 0; j < obj[iQ].length; j++) results.push(dig(obj[iQ][j], qRest, Object.assign({}, opts)));
          opts.results = results
          return opts;
        }
        let r = [];
        for (let j = 0; j < obj[iQ].length; j++) r.push(dig(obj[iQ][j], qRest));
        return r;

      } else if (opts && 'assign' in opts) throw `property '${iQ}[]' does not exist and can not be created`;
      return undefined;
    }

    if (iQ in obj) { // property found
      if (i == q.length - 1) { // query endpoint
        if (opts) {
          if (opts.mutate) obj[iQ] = opts.mutate(obj[iQ], iQ, i, obj);
          opts.found = obj[iQ];
          opts.parent = obj;
          return opts;
        }
        return obj[iQ];

      } if (typeof obj[iQ] == 'object') { // intermediate object
        obj = obj[iQ]; // dig into the object
        if (opts) opts.path.push(obj);

      } else if (opts && 'assign' in opts) throw `property '${iQ}' exists but not an object`;
      else return undefined;

    } else if (opts && 'assign' in opts) { // assignment
      for (;; i++) {
        if (i == q.length - 1) { // query endpoint
          obj[iQ] = opts.assign;
          opts.parent = obj;
          return opts;
        }
        obj[iQ] = opts.makePath ? opts.makePath(iQ, i, opts.path) : {};
        obj = obj[iQ]; // dig into the object
        opts.path.push(obj);
      }

    } else return undefined; // property not found
  }
}

function arr(x) {
  return Array.isArray(x) ? x : [x];
}

function key(code, mods = null, opts = null) {
  let r = { key_code: code };
  if (mods) r.modifiers = mods;
  return opts ? Object.assign(r, opts) : r;
}

function click(btn) {
  let btns = {
    left: 'button1',
    right: 'button2',
    middle: 'button3'
  };
  return {
    pointing_button: btn in btns ? btns[btn] : btn
  };
}

function set_var(name, value, opts = null) {
  let r = {
    set_variable: {
      name: name,
      value: value
    }
  };
  return opts ? Object.assign(r, opts) : r;
}

function if_var(name, value) {
  return {
    type: 'variable_if',
    name: name,
    value: value
  };
}

function unless_var(name, value) {
  return {
    type: 'variable_unless',
    name: name,
    value: value
  };
}

function if_app(...ids) {
  return {
    type: 'frontmost_application_if',
    bundle_identifiers: ids
  };
}

function unless_app(...ids) {
  return {
    type: 'frontmost_application_unless',
    bundle_identifiers: ids
  };
}

function if_lang(...langs) {
  return {
    type: 'input_source_if',
    input_sources: langs.map(item => {
      return { language: item }
    })
  };
}

function unless_lang(...langs) {
  return {
    type: 'input_source_unless',
    input_sources: langs.map(item => {
      return { language: item }
    })
  };
}

module.exports = {
  RuleSet,
  Rule,
  key,
  click,
  set_var,
  if_var, unless_var,
  if_app, unless_app,
  if_lang, unless_lang
};
