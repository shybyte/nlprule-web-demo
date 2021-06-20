/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunknlprule_wasm_webworker_example"] = self["webpackChunknlprule_wasm_webworker_example"] || []).push([["index_js"],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const nlpruleWorker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"nlprule-webworker_js\"), __webpack_require__.b));\n\nconst textInputForm = document.getElementById('textInputForm');\nconst textInputField = document.getElementById('textInputField');\nconst checkButton = document.getElementById('checkButton');\nconst correctionsField = document.getElementById('correctionsField');\nconst loadingSpinner = document.getElementById('loadingSpinner');\n\nfunction checkTextInput() {\n  console.log('Start Check');\n  checkButton.disabled = true;\n  loadingSpinner.style.display = 'block';\n  nlpruleWorker.postMessage({text: textInputField.value});\n}\n\nnlpruleWorker.onmessage = ({data: {eventType, corrections}}) => {\n  switch (eventType) {\n    case 'loaded':\n      checkTextInput();\n      return\n    case 'checkFinished':\n      loadingSpinner.style.display = 'none';\n      checkButton.disabled = false;\n      correctionsField.value = corrections.length > 0\n        ? JSON.stringify(corrections, null, 2)\n        : 'I have found no issue.'\n  }\n};\n\ntextInputForm.addEventListener('submit', async (event) => {\n  event.preventDefault();\n  checkTextInput();\n})\n\n\n\n//# sourceURL=webpack://nlprule-wasm-webworker-example/./index.js?");

/***/ })

}]);