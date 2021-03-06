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


/* Functions to handle events inside the main menu
 * 
 * Accessibility buttons events are managed here.
 */
mainMenu = function() {
    const DEFAULT_FONT_SIZE = [12, 'pt']; // [ Value , Unit ]
    const MAX_FONT_SIZE = DEFAULT_FONT_SIZE[0] * 2;
    const MIN_FONT_SIZE = DEFAULT_FONT_SIZE[0] / 2;

    let containerMenuMain = null;
    let containerPage = null;

    let isMenuBeingShown = false;  // Makes things easier. (Very short code...)
    let windowYScroll = 0;

    document.addEventListener('readystatechange', event => {
        // HTML/DOM elements are ready 
        if (pageState.isInteractive(event)) {            
            containerMenuMain = document.getElementById('site-main-menu');
            containerPage = document.getElementById('container-page');

            accessibility.init();
            // Looks nicer if we force these two functions at the beggining
            hide(force=true);
            close();

            // Listeners

            // Window
            // Resize
            window.addEventListener('resize', toggleContentScrolling, false);

            // Buttons 
            // Close menu
            document.getElementById('btn-site-main-menu-close')
                                .addEventListener('click', close);

            // Font size +/-
            document.getElementById('accessibility-zoom-m')
                                .addEventListener('click',
                                                    accessibility.zoom.minus);
            document.getElementById('accessibility-zoom-p')
                                .addEventListener('click',
                                                    accessibility.zoom.plus);
            document.getElementById('accessibility-zoom-reset')
                                .addEventListener('click',
                                                    accessibility.zoom.reset);
        }

        // Window has been loaded
        if (pageState.isComplete(event)) {
            //
        }
    });

    async function show() {
        isMenuBeingShown = true;

        containerMenuMain.style.display = 'flex';
        await sleep(0.5);  // Hack. Allows the transition to be performed
        containerMenuMain.style.right = '';
        containerMenuMain.style.left = '0';

        toggleContentScrolling();
    }

    function hide(force = false) {
        if ((force && typeof(force) == "boolean") ||
            containerMenuMain.style.right[0] === '0' ) {
            containerMenuMain.style.display = 'none';
        }
    }

    function close() {
        isMenuBeingShown = false;

        containerMenuMain.style.left = '';
        containerMenuMain.style.right = '0';

        toggleContentScrolling();
    }

    function toggleContentScrolling() {
        // Do nothing if top bar is not visible
        if (!header.isBeingShown())
            return;


        // This only works in mobile or when the window's width is small
        // enough to activate CSS mobile's settings.
        // It should also only work once per "menu open" action by the user
        // (that's why we check windowYScroll) and, of course, the user
        // must have requested the menu to open.
        if (isMenuBeingShown && windowYScroll === 0
            && containerMenuMain.offsetWidth === window.innerWidth) {
                windowYScroll = window.scrollY;

                containerPage.style.top = `-${windowYScroll}px`;
                containerPage.classList.add('fixed-position');
        }
        else if (!isMenuBeingShown
            || (isMenuBeingShown && windowYScroll > 0
                && containerMenuMain.offsetWidth != window.innerWidth)) {
            // The conditional in this else if is here because this could be
            // triggered in the middle of an open-menu transition efectively
            // disabling the implemented "scroll locking" method.
            //
            // It can also be triggered by a desktop user enlargin the window.
            containerPage.classList.remove('fixed-position');
            containerPage.style.top = '';
            window.scrollBy(0, getParsedInt(windowYScroll || '0'));

            // Reset so it can be reused (see if first clause)
            windowYScroll = 0;
        }
    }

    accessibility = function () {
        function init() {
            zoom.init();
        }

        zoom = function() {
            const ZOOM_VALUE_CLIENT_STORAGE = 'accessibility-zoom-size';
            const CSS_FONT_SIZE_VARIABLE = '--page-font-size'
            
            let containerRoot = null;
            let containerFontSizeLabel = null;

            function init() {
                containerRoot = document.querySelector(':root');
                containerFontSizeLabel =
                    document.getElementById('accessibility-font-size-label');

                getSize();
            }

            function getComputedSize() {
                const htmlFontSize = selectorVariable.get(
                    containerRoot,
                    CSS_FONT_SIZE_VARIABLE
                );
                let value = getParsedInt(htmlFontSize);
                
                return {
                    value: value,
                    units: getUnits(value, htmlFontSize),
                };
            }

            function setSize(value = 0, units = '') {
                selectorVariable.set(containerRoot,
                    CSS_FONT_SIZE_VARIABLE,
                    value.toString() + units
                );

                // Make changes in the document
                containerFontSizeLabel.innerHTML = value.toString()
                                                + ' '
                                                + units;

                // Save on client storage
                localStorage.setItem(ZOOM_VALUE_CLIENT_STORAGE,
                                    value.toString() + units
                );
            }

            function getSize() {
                const stored = localStorage.getItem(ZOOM_VALUE_CLIENT_STORAGE);

                if (stored == null) {
                    setSize(DEFAULT_FONT_SIZE[0], DEFAULT_FONT_SIZE[1]);
                } else {
                    const value = getParsedInt(stored);
                    const units = getUnits(value, stored);

                    // Reflect changes in the document
                    setSize(value, units);
                }
            }

            function plus() {
                let computed = getComputedSize()
        
                if (computed.value < MAX_FONT_SIZE) {
                    computed.value += 2;
                    setSize(computed.value, computed.units);
                }
            }
            
            function minus() {
                let computed = getComputedSize()
        
                if (computed.value > MIN_FONT_SIZE) {
                    computed.value -= 2;
                    setSize(computed.value, computed.units);
                }
            }

            function reset() {
                setSize(DEFAULT_FONT_SIZE[0], DEFAULT_FONT_SIZE[1]);
            }

            return {
                init: init,
                setSize: setSize,
                getSize: getSize,
                plus: plus,
                minus: minus,
                reset: reset
            }
        }();

        return {
            init: init,
            zoom: zoom
        }
    }();

    return {
        show: show,
        hide: hide,
        close: close,
        isBeingShown: () => isMenuBeingShown
    }
}();
