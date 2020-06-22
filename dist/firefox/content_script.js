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

/**
 * Runs on every open tab.
 * Handles identification of forms on the webpage, tracks submission of those
 * forms and fills forms when credentials are received from another script
 * using the extension message API.
 * */
/**
 * Describes the purpose of the form. Some forms should be filled while others
 * should be ignored or handled as special cases.
 * */
var FormType;
(function (FormType) {
    FormType["Login"] = "login";
    FormType["Card"] = "card";
    FormType["Search"] = "search";
    FormType["ContactInfo"] = "contactinfo";
    FormType["NewsLetter"] = "newsletter";
    FormType["Register"] = "register";
    FormType["Unknown"] = "unknown";
})(FormType || (FormType = {}));
/**
 * Keys should match field names in StoredSafe, form inputs should only be filled
 * with the corresponding StoredSafe data if both type and name (name or id attribute)
 * get a match.
 * */
const matchers = new Map([
    ['username', {
            type: /text|email/,
            name: /user|name|mail/,
        }],
    ['password', {
            type: /password/,
            name: /.*/,
        }],
    ['cardno', {
            type: /text|tel/,
            name: /card/,
        }],
    ['expires', {
            type: /text|tel/,
            name: /exp/,
        }],
    ['cvc', {
            type: /text|tel/,
            name: /sec|code|cvv|cvc/,
        }],
]);
/**
 * Matching the form name is considered a definite match and should return the form type.
 * Not matching a name means the fields fallback should be checked.
 * If using the fields fallback, the form should only be considered a match if all field
 * matchers find a match.
 * The formMatchers will be checked in order of appearance and the first match if any will
 * be used, meaning more generic matchers should be placed further down in the list.
 * */
const formMatchers = new Map([
    [FormType.Search, {
            name: /search/,
            role: /search/,
            fields: [{
                    type: /text|search/,
                    name: /search/,
                }],
        }],
    [FormType.Register, {
            name: /reg|signup/,
            fields: [{
                    type: /password/,
                    name: /re/,
                }],
        }],
    [FormType.Login, {
            name: /login/,
            fields: [
                matchers.get('username'),
                matchers.get('password'),
            ],
        }],
    [FormType.NewsLetter, {
            name: /news|letter/,
            fields: [],
        }],
]);
/**
 * Checks whether an element is of a type that is fillable by the user.
 * @param element Element to be tested.
 * @returns True if the element is an input that can be filled by the user.
 * */
function isElementFillable(element) {
    return element instanceof HTMLInputElement && ![
        'hidden',
        'button',
        'submit',
        'reset'
    ].includes(element.type);
}
/**
 * Checks whether a field is a match for the provded input field.
 * @param field - Name of StoredSafe field.
 * @param element - Input element to attempt a match with.
 * @returns True if the element is a match for the field.
 * */
function isMatch(field, element) {
    if (matchers.get(field) === undefined)
        return false;
    const types = new RegExp(matchers.get(field).type, 'i');
    const name = new RegExp(matchers.get(field).name, 'i');
    return (types.test(element.type) && (name.test(element.name) || name.test(element.id)));
}
/**
 * Checks a form against the form matchers to determine the type of the form.
 * @param form - The form to be matched.
 * @returns The type indicating the purpose of the form.
 * */
function getFormType(form) {
    for (const [formType, formTypeMatchers] of formMatchers) {
        // Check for form name or id match
        const name = new RegExp(formTypeMatchers.name, 'i');
        if (name.test(form.id) || name.test(form.name)) {
            return formType;
        }
        // Check for form role
        const formRole = form.attributes.getNamedItem('role');
        if (formTypeMatchers.role && formRole) {
            const role = new RegExp(formTypeMatchers.role, 'i');
            if (role.test(formRole.value)) {
                return formType;
            }
        }
        // Check for fields match
        let match = formTypeMatchers.fields.length === 0 ? false : true;
        for (let i = 0; i < formTypeMatchers.fields.length; i++) {
            const fieldName = new RegExp(formTypeMatchers.fields[i].name, 'i');
            const fieldType = new RegExp(formTypeMatchers.fields[i].type, 'i');
            let fieldMatch = false;
            for (let j = 0; j < form.length; j++) {
                const element = form[j];
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
                    if (fieldType.test(element.type) && (fieldName.test(element.id) || fieldName.test(element.name))) {
                        fieldMatch = true;
                    }
                }
            }
            // Overall match only if all fields find a matching element.
            match = match && fieldMatch;
        }
        if (match)
            return formType;
    }
    return FormType.Unknown;
}
/**
 * Form types that should be filled by the extension.
 * */
const fillFormTypes = [
    FormType.Login,
    FormType.Card,
];
/**
 * Form types that should be saved by the extension when the form is submitted.
 * */
const saveFormTypes = [
    FormType.Login,
    FormType.Register,
];
let fillForms = [];
/**
 * Scan the webpage for forms and identify the types of those forms.
 * If any fillable forms are found, send a message to the background script to
 * perform a search.
 * If any forms are of a type where we want to save the data they submit, set
 * up an event handler to send the data to the background script when submitted.
 * */
function scanPage() {
    const { forms } = document;
    fillForms = [];
    for (let i = 0; i < forms.length; i++) {
        const formType = getFormType(forms[i]);
        if (fillFormTypes.includes(formType)) {
            fillForms.push(forms[i]);
        }
        if (saveFormTypes.includes(formType)) {
            forms[i].addEventListener('submit', (event) => {
                const values = {};
                const target = event.target;
                for (const [field] of matchers) {
                    for (let i = 0; i < target.length; i++) {
                        const element = target[i];
                        if (element instanceof HTMLInputElement && isMatch(field, element)) {
                            values[field] = element.value;
                        }
                    }
                }
                browser.runtime.sendMessage({ type: 'submit', data: values });
            });
        }
    }
    if (fillForms.length > 0) {
        browser.runtime.sendMessage({
            type: 'tabSearch',
        });
    }
}
// Scan page when the content script is loaded.
scanPage();
/**
 * Fill input fields with StoredSafe data in the appropriate forms/fields.
 * @param data - StoredSafe data.
 * @param submit - Whether or not to submit the form after filling it.
 * */
function fillForm(data, submit = false) {
    for (const form of fillForms) {
        let filled = false;
        for (const element of form) {
            if (element instanceof HTMLInputElement && isElementFillable(element)) {
                let elementFilled = false;
                for (const [field, value] of new Map(data)) {
                    if (isMatch(field, element)) {
                        elementFilled = true;
                        filled = true;
                        element.value = value;
                        break;
                    }
                }
                if (!elementFilled) { // If no field matched this element
                    element.focus(); // Focus element for easier access (example otp field)
                }
            }
        }
        if (filled && submit) {
            // fillForms[i].submit(); // TODO: Fix compatibility with autofill on failed login.
        }
    }
}
/**
 * Handle messages sent to the tab by other scripts.
 * @param message - Message sent by other script.
 * */
function onMessage(message) {
    if (message.type === 'fill') {
        fillForm(message.data);
    }
}
// Set up listener for messages from other scripts within the extension.
browser.runtime.onMessage.addListener(onMessage);


/***/ })

/******/ });
//# sourceMappingURL=content_script.js.map