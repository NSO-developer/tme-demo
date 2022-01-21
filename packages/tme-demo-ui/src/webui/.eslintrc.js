module.exports = {
  'parser': "@babel/eslint-parser",
  "parserOptions": {
    "babelOptions": {
      "rootMode": "upward",
    },
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "settings": {
    "ecmascript": 6,
    "jsx": true
  },
  "plugins": [
    "react",
    "promise"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:promise/recommended"
    "plugin:react/recommended",
  ],
  "rules": {
    "camelcase": "off",
    "jsx-quotes": ["error", "prefer-double"],
    "no-console": "off",
    "no-underscore-dangle": "off",
    "no-unused-vars": ["error", { "args": "none" }],
    "no-var": "warn",
    "prefer-template": "warn",
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "semi": ["error", "always"],
    "strict": "warn",
    "react/prop-types": "off"
  }
}
