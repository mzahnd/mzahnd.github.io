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


const pageState = {
    // HTML/DOM elements are ready 
    isInteractive: (ev) => {
        return (ev.target.readyState === "interactive")
    },
    // Window has been loaded
    isComplete: (ev) => {
        return (ev.target.readyState === "complete")
    }
}

function getParsedInt(value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) { return 0; }
    return parsed;
}

function getUnits(parsed, str) {
    let units = str.replace(parsed.toString(), '');
    return units.trim();
}

function isNumeric(character) {
    return (character >= '0' && character <= '9');
}

selectorVariable = function() {
    function set(selector, variable, newValue) {
        selector.style.setProperty(variable, newValue);
    }

    function get(selector, variable) {
        return getComputedStyle(selector).getPropertyValue(variable);
    }

    return {
        set: set,
        get: get
    };
}();


function sleep(ms) {
    // https://stackoverflow.com/a/39914235
    return new Promise(resolve => setTimeout(resolve, ms));
}

function transitionEndEventName () {
    // https://stackoverflow.com/a/9090128

    let i,
        undefined,
        el = document.createElement('div'),
        transitions = {
            'transition':'transitionend',
            'OTransition':'otransitionend', // oTransitionEnd in very old Opera
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

    for (i in transitions) {
        if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
        }
    }

    throw 'TransitionEnd event not supported.';
}