/*
 *   Copyright 2022 Martín E. Zahnd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */


// Exposed globally
function reCaptchaOnLoadCallback() {
    return reCaptcha.onLoad();
}

const contact = function() {
    const CSS_INVALID_INPUT_CLASS = 'input-invalid';

    let containerForm = null;
    let btnSubmit = null

    document.addEventListener('readystatechange', event => {
        // HTML/DOM elements are ready 
        // if (pageState.isInteractive(event)) {
        //     console.log("Interactive");
        // }

        // Window has been loaded
        if (pageState.isComplete(event)) {
            window.reCaptchaOnLoadCallback = reCaptchaOnLoadCallback;

            
            containerForm = document.getElementById('contact-form');
            btnSubmit = document.getElementById('btn-submit-form');
            // Listeners

            // Buttons
            // Send
            // btnSubmit.addEventListener('click', submit);

            init();
        }
    });

    function init() {
        blockSubmit();

        const childClasses = [
            nameInput,
            emailInput,
            phoneInput,
            messageInput
        ]
        for (let i = 0; i < childClasses.length; i++) {
            childClasses[i].init();
        }
    }

    function allowSubmit() {
        if (!allRequiredFilled() || !reCaptcha.isValid()) {
            blockSubmit();
            return;
        }

        btnSubmit.removeAttribute('disabled');
    }

    function blockSubmit() {
        btnSubmit.setAttribute('disabled', '');
    }

    function allRequiredFilled() {
        const required = [
            nameInput,
            messageInput
        ]
        for (let i = 0; i < required.length; i++) {
            if (!required[i].isValid())
                return false;
        }

        if (!phoneInput.isValid() && !emailInput.isValid()) {
            return false;
        }

        return true;
    }

    function onInvalidGeneric(field, msg) {
        field.setCustomValidity(msg);
    }

    function onInputGeneric(field) {
        field.setCustomValidity('');
    }

    function onlyNumericInputGeneric(field, validationCallback) {
        let allNum = field.value.split("").every(isNumeric);
        if ( allNum && validationCallback()) {
            field.classList.remove(CSS_INVALID_INPUT_CLASS);
        }
        else {
            field.classList.add(CSS_INVALID_INPUT_CLASS);
        }
    }

    function verifyOnUnfocus(field, callback) {
        // Callback must return true/false. 
        field.addEventListener('focusout', (event) => {
            if (callback()) {
                event.target.classList.remove(CSS_INVALID_INPUT_CLASS);
            } else {
                event.target.classList.add(CSS_INVALID_INPUT_CLASS);
            }
        });
    }

    nameInput = function() {
        const MAX_CHARS = 100;

        const validRegex = /^[^\d_\-:\,;{}\[\]\+\*¿¡\?=\(\)/&%$#"!°|¬\\]+$/;
    
        let nameField = null;

        function init() {
            nameField = document.getElementById('field-name');

            nameField.setAttribute('oninvalid', 'nameInput.onInvalid()');
            nameField.setAttribute('oninput', 'nameInput.onInput()');

            nameField.addEventListener('input', allowSubmit);

            verifyOnUnfocus(nameField, isValid);
        }

        function isValid() {
            const nameLen = nameField.value.length;
            
            return (nameLen < MAX_CHARS && validRegex.test(nameField.value));
        }

        function onInvalid() {
            nameField.setCustomValidity('I\'d like to address you by your name!');
        }

        function onInput() {
            nameField.setCustomValidity('');
        }

        return {
            init: init,
            isValid: isValid,
            onInvalid: onInvalid,
            onInput: onInput
        };
    }();

    emailInput = function() {
        // From:
        // https://www.w3resource.com/javascript/form/email-validation.php
        const validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
        let emailField = null;

        function init() {
            emailField = document.getElementById('field-email');

            emailField.setAttribute('oninvalid', 'emailInput.onInvalid()');
            emailField.setAttribute('oninput', 'emailInput.onInput()');

            emailField.addEventListener('input', allowSubmit);

            verifyOnUnfocus(emailField, isValid);
            emailField.addEventListener('focusout', crossCheckPhoneField);
        }

        function isValid() {
            return validRegex.test(emailField.value);
        }

        function onInvalid() {
            onInvalidGeneric(emailField, "Please provide a valid email address.");
        }

        function onInput() {
            onInputGeneric(emailField);
        }

        function crossCheckPhoneField(event) {
            if (phoneInput.isValid() && emailField.value.length == 0) {
                event.target.classList.remove(CSS_INVALID_INPUT_CLASS);
            } 
        }

        return {
            init: init,
            isValid: isValid,
            onInvalid: onInvalid,
            onInput: onInput
        };
    }();

    phoneInput = function() {
        let areaCodeField = null;
        let numberField = null;

        function init() {
            areaCodeField = document.getElementById('field-area-code');
            numberField = document.getElementById('field-phone');

            areaCodeField.setAttribute('oninvalid', 'phoneInput.areaCode.onInvalid()');
            areaCodeField.setAttribute('oninput', 'phoneInput.areaCode.onInput()');
            areaCodeField.setAttribute('onkeyup', 'phoneInput.areaCode.onlyNumericInput()');

            numberField.setAttribute('oninvalid', 'phoneInput.number.onInvalid()');
            numberField.setAttribute('oninput', 'phoneInput.number.onInput()');
            numberField.setAttribute('onkeyup', 'phoneInput.number.onlyNumericInput()');

            areaCodeField.addEventListener('input', allowSubmit);
            numberField.addEventListener('input', allowSubmit);
        }

        function isValid() {
            return (areaCode.isValid() && number.isValid() );
        }

        areaCode = function() {
            const validRegex = /^(?!0)\d{2,4}$/;
            const invalidMsg = 
                "Código de área inválido. Debe tener entre 2 y 4 dígitos.";
            
            function isValid() {
                return validRegex.test(areaCodeField.value);
            }

            function onInvalid() {
                onInvalidGeneric(areaCodeField, invalidMsg);
            }
    
            function onInput() {
                onInputGeneric(areaCodeField);
            }

            function onlyNumericInput() {
                onlyNumericInputGeneric(areaCodeField, isValid);
            }

            return {
                onInvalid: onInvalid,
                isValid: isValid,
                onInput: onInput,
                onlyNumericInput: onlyNumericInput
             };
        }();

        number = function() {
            const validRegex = /^\d{6,8}$/;
            const invalidMsg = 
                "Número telefónico inválido. Debe tener entre 6 y 8 dígitos.";

            function isValid() {
                return validRegex.test(numberField.value);
            }

            function onInvalid() {
                onInvalidGeneric(numberField, invalidMsg);
            }
    
            function onInput() {
                onInputGeneric(numberField);
            }

            function onlyNumericInput() {
                onlyNumericInputGeneric(numberField, isValid);
            }

            return {
                isValid: isValid,
                onInvalid: onInvalid,
                onInput: onInput,
                onlyNumericInput: onlyNumericInput
             };
        }();

        return {
            init: init,
            isValid: isValid,
            areaCode: areaCode,
            number: number
        };
    }();

    messageInput = function() {
        const MAX_MSG_CHARS = 2048;

        let messageField = null;
        let containerCharCounter = null;
        let charCounter = null;

        function init() {
            messageField = document.getElementById('field-msg');
            containerCharCounter = document.getElementById('container-char-counter');
            charCounter = document.getElementById('char-counter');
            
            // Hide fast
            containerCharCounter.style.display = 'none';

            messageField.addEventListener('input', allowSubmit);
            messageField.addEventListener('input', messageInput.updateCharCounter);

            messageField.setAttribute('oninvalid', 'messageInput.onInvalid()');
            messageField.setAttribute('oninput', 'messageInput.onInput()');

            messageField.setAttribute('maxlength', `${MAX_MSG_CHARS}`);

            verifyOnUnfocus(messageField, isValid);

            updateCharCounter();

        }

        function updateCharCounter() {
            const msgLength = messageField.value.length;

            if (msgLength < MAX_MSG_CHARS * 0.8) {
                containerCharCounter.style.display = 'none';
                return;
            }

            let charMsg = `${msgLength}/${MAX_MSG_CHARS}`;
            charCounter.innerHTML = charMsg;
            
            containerCharCounter.style.display = '';
        }

        function isValid() {
            const msgLength = messageField.value.length;
            return (msgLength > 1 && msgLength < MAX_MSG_CHARS);
        }

        function onInvalid() {
            onInvalidGeneric(messageField, "Tell me something...");
        }

        function onInput() {
            onInputGeneric(messageField);
        }

        return {
            init: init,
            updateCharCounter: updateCharCounter,
            isValid: isValid,
            onInvalid: onInvalid,
            onInput: onInput
        };
    }();

    return {
        allowSubmit: allowSubmit,
        blockSubmit: blockSubmit
    }
}();



const reCaptcha = function() {
    const CAPTCHA_ID = 'google-recaptcha'
    let validCaptcha = false;

    function onLoadCallback() {
        grecaptcha.render(CAPTCHA_ID, {
            // Personal reCaptcha ID:
            // 'sitekey': '6Ld3WogeAAAAABzqnIRaYMsM8ara91UgSJcjh2J7',
            // Basin reCaptcha ID:
            'sitekey': '6Lew3SMUAAAAAJ82QoS7gqOTkRI_dhYrFy1f7Sqy',
            'theme': 'dark',
            'size': 'normal',
            'callback': reCaptcha.correct,
            'expired-callback': reCaptcha.expired,
            'error-callback': reCaptcha.error
            });
    }

    function correctCallback() {
        validCaptcha = true;
        contact.allowSubmit();
    }

    function expiredCallback() {
        validCaptcha = false;
        contact.blockSubmit();
    }

    function errorCallback() {
        validCaptcha = false;
        contact.blockSubmit();
    }

    function isValid() {
        return validCaptcha;
    }

    return {
        onLoad: onLoadCallback,
        correct: correctCallback,
        expired: expiredCallback,
        error: errorCallback,
        isValid: isValid
    }
}();
