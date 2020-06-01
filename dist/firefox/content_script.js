/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/scripts/content_script.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/scripts/content_script.ts":
/*!***************************************!*\
  !*** ./src/scripts/content_script.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// const types = /text|url|password|email/i;
// const ids = /user|name|pass|mail|url|server|site/i;
console.log('Content script loaded');
browser.runtime.sendMessage({
    type: 'tabSearch',
});
const matchers = {
    username: {
        types: /text|email/,
        name: /user|name|mail/,
    },
    password: {
        types: /password/,
        name: /.*/,
    },
    cardno: {
        types: /text|tel/,
        name: /card/,
    },
    expires: {
        types: /text|tel/,
        name: /exp/,
    },
    cvc: {
        types: /text|tel/,
        name: /sec|code|cvv|cvc/,
    },
};
function isMatch(field, element) {
    if (matchers[field] === undefined)
        return false;
    const types = new RegExp(matchers[field].types, 'i');
    const name = new RegExp(matchers[field].name, 'i');
    return (types.test(element.type) && (name.test(element.name) || name.test(element.id)));
}
const { forms } = document;
function onMessage(message) {
    console.log(message);
    if (message.type === 'fill') {
        for (let i = 0; i < forms.length; i++) {
            let filled = false;
            for (let j = 0; j < forms[i].length; j++) {
                const element = forms[i][j];
                Object.keys(message.data).forEach((field) => {
                    if (isMatch(field, element)) {
                        filled = true;
                        element.value = message.data[field];
                        console.log(filled, message.data[field]);
                    }
                });
            }
            console.log(filled);
            if (filled) {
                console.log(forms[i]);
                forms[i].submit();
            }
        }
    }
}
browser.runtime.onMessage.addListener(onMessage);


/***/ })

/******/ });
//# sourceMappingURL=content_script.js.map