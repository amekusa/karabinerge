# KARABINERGE (karabiner + forge)
Karabiner-Elements complex modifications generator

[📘 Full Documentation](https://amekusa.github.io/karabinerge/latest/index.html)

[![npm](https://img.shields.io/badge/dynamic/json?label=npm%0Apackage&query=%24%5B%27dist-tags%27%5D%5B%27latest%27%5D&url=https%3A%2F%2Fregistry.npmjs.org%2Fkarabinerge%2F)](https://www.npmjs.com/package/karabinerge)

## What's this
Karabinerge provides you some functions and classes that help you to **programmatically generate complex modifications** of Karabiner-Elements for your needs with **very short and readable codes**.


## How to install
```sh
npm i --save karabinerge

# or install globally:
npm i -g karabinerge
```

## How to use
```js
// example.js

with (require('karabinerge')) {
  let rules = new RuleSet('My Rules');

  rules.add('control + H to backspace')
    .remap({
      from: key('h', 'control'),
      to:   key('delete_or_backspace')
    });

  rules.out(); // stdout JSON
}
```

```sh
# run
node example.js > example.json
```

`example.json` :
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
with (require('karabinerge')) {
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
}
```
Generates:

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

- Mighty Thumb [(github.com/amekusa/mighty-thumb/blob/master/karabiner-elements/mighty-thumb.js)](https://github.com/amekusa/mighty-thumb/blob/master/karabiner-elements/mighty-thumb.js)


## More details
Please see: [📘 Full Documentation](https://amekusa.github.io/karabinerge/latest/index.html)


---
Licensed under the MIT license.  
2022 &copy; Satoshi Soma ([amekusa.com](https://amekusa.com))
