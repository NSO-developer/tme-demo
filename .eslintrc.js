module.exports = {
  "parser": "babel-eslint",
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
  ],
  "rules": {
    "strict": "warn",
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "prefer-template": "warn",
    "jsx-quotes": ["error", "prefer-double"],
    "no-unused-vars": "off",
    "camelcase": "off",
    "no-underscore-dangle": "off",
    "no-console": "off",
    "semi": ["error", "always"]
  }
}
