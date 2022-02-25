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


header = function() {
    let containerTopBar = null;
    let containerMenuMain = null;
    let containerBtnToggleMenu = null;    
    let containerPageContent = null;
    let containerFlexSeparator = null;

    let previousYCoord = 0;  // For window scrolling. See userScroll()
    let scrollYAccumulator = 0;
    let isTopBarBeingShown = true;

    document.addEventListener('readystatechange', event => {
        // HTML/DOM elements are ready 
        if (pageState.isInteractive(event)) {
            containerTopBar = document.getElementById('top-bar');
            containerMenuMain = document.getElementById('site-main-menu');
            containerBtnToggleMenu =
                            document.getElementById('btn-toggle-menu');
            containerPageContent =
                            document.getElementsByClassName('page-content');
            containerFlexSeparator =
                            document.getElementsByClassName('flex-separator');

            // Listeners

            // Window
            // Scrolling
            window.addEventListener('scroll', userScroll, false);

            // Transitions
            try {
                containerMenuMain.addEventListener(transitionEndEventName(),
                                                        mainMenu.hide, true);
                // Force hiding the menu to avoid seeing it when rotating the
                // screen (in a phone or tablet)
                mainMenu.hide(true);
            } catch (e) {
                console.log(e);
            }
    
            // Buttons 
            // Toggle main menu in header
            containerBtnToggleMenu.addEventListener('click',
                                                    menuToggle, false);
    
            // Close main menu when clicking in the content section
            for (let i=0, len=containerPageContent.length; i < len; i++) {
                containerPageContent[i].addEventListener('click',
                    mainMenu.close, false);
            }
            
            for (let i=0, len=containerFlexSeparator.length; i < len; i++) {
                containerFlexSeparator[i].addEventListener('click',
                    mainMenu.close, false);
            }
        }
    
        // Window has been loaded
        if (pageState.isComplete(event)) {
            // Hide menu
            mainMenu.hide();
        }
    });

    function menuToggle() {
        const computedLeft = getParsedInt(
                    window.getComputedStyle(containerMenuMain)
                    .getPropertyValue('left')
        );
        
        if (computedLeft) {
            mainMenu.show();
        } else {
            mainMenu.close();
        }
    }

    function userScroll() {
        // Does not work when the main menu is open. This is on purpose to
        // avoid a bug where the user scrolls up and down and ends up
        // modifying (scrolling and showing/hidding things) the page while
        // the menu is open.
        if (mainMenu.isBeingShown()) {
            console.log("Menu being shown");
            return;
        }

        const currentYCoord = window.scrollY;
        const lengthScrolled = Math.abs(currentYCoord - previousYCoord);

        if (currentYCoord < previousYCoord) {
            // Scroll up
            scrollYAccumulator -= lengthScrolled;

            if (Math.abs(scrollYAccumulator) > containerTopBar.offsetHeight) {
                showTopBar();

                scrollYAccumulator = 0;
            }
        }
        else if (currentYCoord > previousYCoord) {
            // Scroll down
            scrollYAccumulator += lengthScrolled;

            if (Math.abs(scrollYAccumulator) > containerTopBar.offsetHeight) {
                hideTopBar();

                scrollYAccumulator = 0;
            }
        }

        previousYCoord = currentYCoord;
    }

    function hideTopBar() {
        containerTopBar.classList.add('hidden');
        isTopBarBeingShown = false;
    }

    function showTopBar() {
        containerTopBar.classList.remove('hidden');
        isTopBarBeingShown = true;
    }

    return {
        isBeingShown: () => isTopBarBeingShown
    }
}();
