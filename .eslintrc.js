module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "jasmine": true
    },
    "globals": {
        "$": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": [
            "error",
            {"allow": ["warn", "error"]}
        ],
        "react/no-deprecated": [
            1,
        ],
        "react/jsx-no-target-blank": [
            0,
        ],
    },
    "settings": {
        "react": {
            "version": "16.2"
        }
    }
};
