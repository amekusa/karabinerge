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

/**
 * A collection of one or more modification rules
 *
 * @example
 * let rules = new RuleSet('My Rules');
 */
class RuleSet {
  /**
   * @param {string} title - title of this ruleset
   */
  constructor(title) {
    this.title = title;
    this.rules = [];
  }
  /**
   * Adds an rule to this ruleset.
   * If the provided argument is a string, a new instance of {@link Rule} will be created with the string as its description.
   * If the provided argument is an instance of {@link Rule}, simply adds it to the collection
   * @param {string|Rule} rule - rule description or an instance of {@link Rule}
   * @return {Rule} added rule
   * @example <caption>Adding a new rule with description</caption>
   * let rule = rules.add('My 1st rule');
   * @example <caption>Adding a rule instance</caption>
   * let rule = rules.add(new Rule('My 1st rule'));
   */
  add(rule) {
    if (!(rule instanceof Rule)) rule = new Rule(rule);
    this.rules.push(rule);
    return rule;
  }
  /**
   * Returns a plain object representation of this ruleset
   * @return {object} an object like: `{ title: ... , rules: ... }`
   * @example
   * let rules = new RuleSet('My Rules');
   * let obj = rules.toJSON();
   * console.log( obj.title ); // 'My Rules'
   */
  toJSON() {
    return {
      title: this.title,
      rules: this.rules.map(item => item.toJSON())
    };
  }
  /**
   * Outputs JSON representation of the whole rule set to STDOUT
   */
  out() {
    console.log(JSON.stringify(this, null, 2));
  }
}

/**
 * A complex modification rule
 */
class Rule {
  /**
   * @param {string} desc - rule description
   */
  constructor(desc) {
    this.desc = desc;
    this.remaps = [];
    this.conds = [];
  }
  /**
   * Defines a `from-to` remap rule
   * @param {object} map - rule definition like: `{ from: ... , to: ... }`
   * @return {Rule} this
   * @example <caption>Remap control + H to backspace</caption>
   * let rule = new Rule('control + H to backspace')
   *   .remap({
   *     from: key('h', 'control'),
   *     to:   key('delete_or_backspace')
   *   });
   * @example <caption>Multiple remap rules</caption>
   * let rule = new Rule('Various Remaps')
   *   .remap( ... )
   *   .remap( ... )
   *   .remap( ... );
   */
  remap(map) {
    if (!map.type) map = { type: 'basic', ...map };
    if (this.conds.length) map = Object.assign(map, { conditions: this.conds });
    this.remaps.push(remapSanitizer.sanitize(map));
    return this;
  }
  /**
   * Defines a condition
   * @param {object} cond - condition definition like: `{ type: 'variable_if', ... }`
   * @return {Rule} this
   * @example <caption>Remap rules only for VSCode</caption>
   * let rule = new Rule('VSCode Rules')
   *   .cond(if_app('com.microsoft.VSCode'))
   *   .remap( ... )
   *   .remap( ... );
   * @example <caption>Multiple conditions</caption>
   * let rule = new Rule('VSCode Rules')
   *   .cond(if_var('foo', 1))  // if variable 'foo' is 1
   *   .cond(if_app('com.microsoft.VSCode'))
   *   .remap( ... )
   *   .remap( ... );
   */
  cond(cond) {
    this.conds.push(cond);
    return this;
  }
  /**
   * Returns a plain object representation of this rule
   * @return {object} an object like: `{ description: ... , manipulators: ... }`
   */
  toJSON() {
    return {
      description: this.desc,
      manipulators: this.remaps
    };
  }
}

/**
 * User configuration of Karabiner-Elements
 */
class Config {
  static new(...args) {
    return new this(...args);
  }
  /**
   * @param {string} [file='~/.config/karabiner/karabiner.json'] - config file to read/write
   */
  constructor(file = null) {
    this.setFile(file || path.join(os.homedir(), '.config', 'karabiner', 'karabiner.json'));
    this.data = null;
  }
  /**
   * Sets the config file path
   * @param {string} file - config file path
   * @return {Config} this
   */
  setFile(file) {
    this.file = file;
    return this;
  }
  /**
   * Reads data from the config file
   * @return {Config} this
   */
  load(file = null) {
    if (!file) file = this.file;
    let content = fs.readFileSync(file, 'utf8');
    this.data = JSON.parse(content);
    return this;
  }
  /**
   * Writes the current data on the config file
   * @return {Config} this
   */
  save(file = null) {
    if (!file) file = this.file;
    let content = JSON.stringify(this.data, null, 4);
    fs.writeFileSync(file, content, 'utf8');
    return this;
  }
  /**
   * Creates a backup of the config file with `.bak` extension in the same directory as the original file.
   * If an old backup exists, it will be overwritten
   * @return {Config} this
   */
  backup() {
    return this.save(this.file + '.bak');
  }
  /**
   * Restores data from a backup file
   * @return {Config} this
   */
  loadBackup() {
    return this.load(this.file + '.bak');
  }
  /**
   * Deletes a backup file
   * @return {Config} this
   */
  deleteBackup() {
    fs.unlinkSync(this.file + '.bak');
    return this;
  }
  /**
   * The current profile object
   * @type {object}
   */
  get currentProfile() {
    if (!this.data) this.load();
    let profs = this.data.profiles;
    if (!profs.length) throw `no profiles`;
    for (let i = 0; i < profs.length; i++) {
      if (profs[i].selected) return profs[i];
    }
    throw `no active profile`;
  }
  /**
   * Clears all the rules in the current profile
   * @return {Config} this
   */
  clearRules() {
    return this.setRules([]);
  }
  /**
   * Sets the provided rules to the current profile
   * @param {object[]} rules - an array of rule definitions
   * @return {Config} this
   */
  setRules(rules) {
    dig(this.currentProfile, 'complex_modifications.rules', { set: rules, makePath: true, throw: true });
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

/**
 * Returns a `key_code` object
 * @param {string} code - key code
 * @param {string|object|string[]} mods - modifiers
 * @param {object} [opts] - optional properties
 * @return {object} an object like: `{ key_code: ... }`
 */
function key(code, mods = null, opts = null) {
  let r = { key_code: code };
  if (mods) r.modifiers = mods;
  return opts ? Object.assign(r, opts) : r;
}

/**
 * Returns a `pointing_button` object
 * @param {string} btn - button name
 * - `button1`
 * - `button2`
 * - `button3`
 * - `left` (alias for `button1`)
 * - `right` (alias for `button2`)
 * - `middle` (alias for `button3`)
 * @return {object} an object like: `{ pointing_button: ... }`
 */
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

/**
 * Returns a `set_variable` object
 * @param {string} name - variable name
 * @param {string|number} value - value to assign
 * @param {object} [opts] - optional properties
 * @return {object} an object like: `{ set_variable: { ... } }`
 */
function set_var(name, value, opts = null) {
  let r = {
    set_variable: {
      name: name,
      value: value
    }
  };
  return opts ? Object.assign(r, opts) : r;
}

/**
 * Returns a `variable_if` condition object
 * @param {string} name - variable name
 * @param {string|number} value - value to check
 * @return {object} an object like: `{ type: 'variable_if', ... }`
 */
function if_var(name, value) {
  return {
    type: 'variable_if',
    name: name,
    value: value
  };
}

/**
 * Returns a `variable_unless` condition object
 * @param {string} name - variable name
 * @param {string|number} value - value to check
 * @return {object} an object like: `{ type: 'variable_unless', ... }`
 */
function unless_var(name, value) {
  return {
    type: 'variable_unless',
    name: name,
    value: value
  };
}

/**
 * Returns a `frontmost_application_if` condition object
 * @param {...string} id - application id
 * @return {object} an object like: `{ type: 'frontmost_application_if', ... }`
 */
function if_app(...id) {
  return {
    type: 'frontmost_application_if',
    bundle_identifiers: id
  };
}

/**
 * Returns a `frontmost_application_unless` condition object
 * @param {...string} id - application ID
 * @return {object} an object like: `{ type: 'frontmost_application_unless', ... }`
 */
function unless_app(...id) {
  return {
    type: 'frontmost_application_unless',
    bundle_identifiers: id
  };
}

/**
 * Returns a `input_source_if` condition object
 * @param {...string} lang - language code
 * @return {object} an object like: `{ type: 'input_source_if', ... }`
 */
function if_lang(...lang) {
  return {
    type: 'input_source_if',
    input_sources: lang.map(item => {
      return { language: item }
    })
  };
}

/**
 * Returns a `input_source_unless` condition object
 * @param {...string} lang - language code
 * @return {object} an object like: `{ type: 'input_source_unless', ... }`
 */
function unless_lang(...lang) {
  return {
    type: 'input_source_unless',
    input_sources: lang.map(item => {
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
