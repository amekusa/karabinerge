# KARABINERGE
[![NPM Version](https://img.shields.io/npm/v/karabinerge?style=for-the-badge&label=npm%20package)](https://www.npmjs.com/package/karabinerge) [![NPM License](https://img.shields.io/npm/l/karabinerge?style=for-the-badge)](https://github.com/amekusa/karabinerge/blob/trunk/LICENSE)

Karabiner-Elements complex modifications generator

<!--TRUNCATE:START-->
[📘 Full Documentation](https://amekusa.github.io/karabinerge/latest/index.html)
<!--TRUNCATE:END-->


## What this is
Karabinerge provides useful functions and classes that help you to **programmatically generate complex modifications** of Karabiner-Elements in a simple and short syntax.

Tired of tinkering with JSON by your hand? This is for you.


## How to install
```sh
npm i --save karabinerge

# as global package
npm i -g karabinerge
```

## How to use
```js
// example.js
import {RuleSet, key} from 'karabinerge'; // ES6
const {RuleSet, key} = require('karabinerge'); // CJS

let rules = new RuleSet('My Rules');

rules.add('control + H to backspace')
  .remap({
    from: key('h', 'control'),
    to:   key('delete_or_backspace')
  });

rules.out(); // output JSON to stdout
```

Run it on terminal:
```sh
node example.js > example.json
```

Result (`example.json`):
```json
{
  "title": "My Rules",
  "rules": [
    {
      "description": "control + H to backspace",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "h",
            "modifiers": {
              "mandatory": [
                "control"
              ]
            }
          },
          "to": [
            {
              "key_code": "delete_or_backspace"
            }
          ]
        }
      ]
    }
  ]
}
```

## More examples
```js
import {RuleSet, key} from 'karabinerge';
let rules = new RuleSet('My Rules');

rules.add('command + H/J/K/L to arrow keys')
  .remap({
    from: key('h', 'command'),
    to:   key('left_arrow')
  })
  .remap({
    from: key('j', 'command'),
    to:   key('down_arrow')
  })
  .remap({
    from: key('k', 'command'),
    to:   key('up_arrow')
  })
  .remap({
    from: key('l', 'command'),
    to:   key('right_arrow')
  });

rules.out();
```

Result:
```json
{
  "title": "My Rules",
  "rules": [
    {
      "description": "command + H/J/K/L to arrow keys",
      "manipulators": [
        {
          "type": "basic",
          "from": {
            "key_code": "h",
            "modifiers": {
              "mandatory": [
                "command"
              ]
            }
          },
          "to": [
            {
              "key_code": "left_arrow"
            }
          ]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "j",
            "modifiers": {
              "mandatory": [
                "command"
              ]
            }
          },
          "to": [
            {
              "key_code": "down_arrow"
            }
          ]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "k",
            "modifiers": {
              "mandatory": [
                "command"
              ]
            }
          },
          "to": [
            {
              "key_code": "up_arrow"
            }
          ]
        },
        {
          "type": "basic",
          "from": {
            "key_code": "l",
            "modifiers": {
              "mandatory": [
                "command"
              ]
            }
          },
          "to": [
            {
              "key_code": "right_arrow"
            }
          ]
        }
      ]
    }
  ]
}
```

## Real life examples
- [Keycomfort](https://github.com/amekusa/keycomfort)
- [Mighty Thumb](https://github.com/amekusa/mighty-thumb/blob/master/karabiner-elements/mighty-thumb.js)

<!--TRUNCATE:START-->
## More details
See: [📘 Full Documentation](https://amekusa.github.io/karabinerge/latest/index.html)


---
Karabinerge &copy; 2022 Satoshi Soma ([amekusa.com](https://amekusa.com))
Licensed under the MIT license
<!--TRUNCATE:END-->
