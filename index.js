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

const
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  dig = require('obj-digger');

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

class Config {
  static new(...args) {
    return new this(...args);
  }
  constructor(file = null) {
    this.setFile(file || path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json'));
    this.data = null;
  }
  setFile(file) {
    this.file = file;
    return this;
  }
  load(file = null) {
    if (!file) file = this.file;
    let content = fs.readFileSync(file, 'utf8');
    this.data = JSON.parse(content);
    return this;
  }
  save(file = null) {
    if (!file) file = this.file;
    let content = JSON.stringify(this.data, null, 4);
    fs.writeFileSync(file, content, 'utf8');
    return this;
  }
  backup() {
    return this.save(this.file + '.bak');
  }
  loadBackup() {
    return this.load(this.file + '.bak');
  }
  deleteBackup() {
    fs.unlinkSync(this.file + '.bak');
    return this;
  }
  get currentProfile() {
    if (!this.data) this.load();
    let profs = this.data.profiles;
    if (!profs.length) throw `no profiles`;
    for (let i = 0; i < profs.length; i++) {
      if (profs[i].selected) return profs[i];
    }
    throw `no active profile`;
  }
  clearRules() {
    dig(this.currentProfile, 'complex_modifications.rules', { set: [], makePath: true, throw: true });
    return this;
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
  Config,
  key,
  click,
  set_var,
  if_var, unless_var,
  if_app, unless_app,
  if_lang, unless_lang
};
