import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
];


// import globals from 'globals';
// import js from '@eslint/js';

// export default [
//   js.configs.recommended,
//   {
//     languageOptions: {
//       globals: globals.browser,
//       ecmaVersion: 'latest',
//       sourceType: 'module',
//     },
//   },
// ];
