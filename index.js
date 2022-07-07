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
}

class Rule {
  constructor(desc) {
    this.desc = desc;
    this.remaps = [];
    this.conds = [];
  }
  remap(map) {
    let _map = { type: 'basic', ...map };
    if (this.conds.length) _map = Object.assign(_map, { conditions: this.conds });
    this.remaps.push(_map);
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

function _arr(x) {
  return Array.isArray(x) ? x : [x];
}

function _arr_prop(obj, ...props) {
  for (let prop of props) {
    if (!(prop in obj)) continue;
    if (Array.isArray(obj[prop])) continue;
    obj[prop] = [obj[prop]];
  }
  return obj;
}

function key(code, mods = null, opts = null) {
  let r = {
    key_code: code,
  };
  if (mods) {
    switch (typeof mods) {
      case 'string':
        mods = [mods]; break;
      case 'object':
        _arr_prop(mods, 'mandatory', 'optional');
    }
    r.modifiers = mods;
  }
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
