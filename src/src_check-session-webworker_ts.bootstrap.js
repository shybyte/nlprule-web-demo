/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/promise-worker/index.js":
/*!**********************************************!*\
  !*** ./node_modules/promise-worker/index.js ***!
  \**********************************************/
/***/ ((module) => {

eval("\n\nvar messageIds = 0;\n\nfunction onMessage(self, e) {\n  var message = e.data;\n\n  if (!Array.isArray(message) || message.length < 2) {\n    // Ignore - this message is not for us.\n    return;\n  }\n\n  var messageId = message[0];\n  var error = message[1];\n  var result = message[2];\n  var callback = self._callbacks[messageId];\n\n  if (!callback) {\n    // Ignore - user might have created multiple PromiseWorkers.\n    // This message is not for us.\n    return;\n  }\n\n  delete self._callbacks[messageId];\n  callback(error, result);\n}\n\nfunction PromiseWorker(worker) {\n  var self = this;\n  self._worker = worker;\n  self._callbacks = {};\n  worker.addEventListener('message', function (e) {\n    onMessage(self, e);\n  });\n}\n\nPromiseWorker.prototype.postMessage = function (userMessage) {\n  var self = this;\n  var messageId = messageIds++;\n  var messageToSend = [messageId, userMessage];\n  return new Promise(function (resolve, reject) {\n    self._callbacks[messageId] = function (error, result) {\n      if (error) {\n        return reject(new Error(error.message));\n      }\n\n      resolve(result);\n    };\n    /* istanbul ignore if */\n\n\n    if (typeof self._worker.controller !== 'undefined') {\n      // service worker, use MessageChannels because e.source is broken in Chrome < 51:\n      // https://bugs.chromium.org/p/chromium/issues/detail?id=543198\n      var channel = new MessageChannel();\n\n      channel.port1.onmessage = function (e) {\n        onMessage(self, e);\n      };\n\n      self._worker.controller.postMessage(messageToSend, [channel.port2]);\n    } else {\n      // web worker\n      self._worker.postMessage(messageToSend);\n    }\n  });\n};\n\nmodule.exports = PromiseWorker;\n\n//# sourceURL=webpack://nlprule-wasm-webworker-example-solidjs/./node_modules/promise-worker/index.js?");

/***/ }),

/***/ "./src/check-session-webworker.ts":
/*!****************************************!*\
  !*** ./src/check-session-webworker.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var promise_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! promise-worker */ \"./node_modules/promise-worker/index.js\");\n/* harmony import */ var promise_worker__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(promise_worker__WEBPACK_IMPORTED_MODULE_0__);\n\nconst NUMBER_OF_WORKERS = Math.max(2, Math.floor(navigator.hardwareConcurrency / 4));\nconsole.log(`Starting ${NUMBER_OF_WORKERS} NlpRule workers ...`);\n\nfunction createNlpRuleWorker() {\n  return new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"src_nlprule-webworker_ts\"), __webpack_require__.b));\n}\n\nlet currentLoadingNlpRuleWorker = createNlpRuleWorker();\nconst promiseWorkers = [];\nlet correctionIdCounter = 0;\nconst correctionBySentenceCache = new Map();\nlet currentWorkerIndex = 0;\n\nasync function checkSentenceWithCaching(sentence) {\n  const cachedResult = correctionBySentenceCache.get(sentence);\n\n  if (cachedResult) {\n    return cachedResult;\n  }\n\n  const promiseWorker = promiseWorkers[currentWorkerIndex];\n  currentWorkerIndex = (currentWorkerIndex + 1) % promiseWorkers.length;\n  const result = await promiseWorker.postMessage({\n    command: 'check',\n    text: sentence\n  });\n  correctionBySentenceCache.set(sentence, result);\n  return result;\n}\n\nself.onmessage = async ({\n  data: {\n    text\n  }\n}) => {\n  console.time('Check');\n  const sentences = await promiseWorkers[0].postMessage({\n    command: 'sentencize',\n    text: text\n  });\n  currentWorkerIndex = 0;\n  const sentencePromises = sentences.map(async sentence => {\n    const correctionsWasm = await checkSentenceWithCaching(sentence.text);\n    const corrections = correctionsWasm.map(it => {\n      const position = {\n        start: sentence.position + it.span.char.start,\n        end: sentence.position + it.span.char.end\n      };\n      return { ...it,\n        id: 'id_' + correctionIdCounter++,\n        position: position,\n        issueText: text.slice(position.start, position.end)\n      };\n    });\n\n    if (corrections.length > 0) {\n      self.postMessage({\n        eventType: 'corrections',\n        corrections: corrections\n      });\n    }\n  });\n  await Promise.allSettled(sentencePromises);\n  console.timeEnd('Check');\n  self.postMessage({\n    eventType: 'checkFinished'\n  });\n};\n\nfunction onNlpWorkerLoaded() {\n  promiseWorkers.push(new (promise_worker__WEBPACK_IMPORTED_MODULE_0___default())(currentLoadingNlpRuleWorker));\n\n  if (promiseWorkers.length === 1) {\n    self.postMessage({\n      eventType: 'loaded'\n    });\n  }\n\n  if (promiseWorkers.length < NUMBER_OF_WORKERS) {\n    currentLoadingNlpRuleWorker = createNlpRuleWorker();\n    setWorkerOnLoadHandler(currentLoadingNlpRuleWorker);\n  }\n}\n\nfunction setWorkerOnLoadHandler(worker) {\n  worker.onmessage = message => {\n    if (message.data.eventType === 'loaded') {\n      onNlpWorkerLoaded();\n    }\n  };\n}\n\nsetWorkerOnLoadHandler(currentLoadingNlpRuleWorker);\n\n//# sourceURL=webpack://nlprule-wasm-webworker-example-solidjs/./src/check-session-webworker.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "./src/" + chunkId + ".bootstrap.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = self.location + "/../../";
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_check-session-webworker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		// no chunk loading
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/check-session-webworker.ts");
/******/ 	
/******/ })()
;