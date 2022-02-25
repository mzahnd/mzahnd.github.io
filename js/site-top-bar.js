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
    let containerMenuMain = null;
    let containerBtnToggleMenu = null;    
    let containerPageContent = null;
    let containerFlexSeparator = null;
    
    function menuToggle() {
        const computedLeft =getParsedInt(
                    window.getComputedStyle(containerMenuMain)
                    .getPropertyValue('left')
        );
        
        if (computedLeft) {
            mainMenu.show();
        } else {
            mainMenu.close();
        }
    }

    document.addEventListener('readystatechange', event => {
        // HTML/DOM elements are ready 
        if (pageState.isInteractive(event)) {
            containerMenuMain = document.getElementById('site-main-menu');
            containerBtnToggleMenu =
                            document.getElementById('btn-toggle-menu');
            containerPageContent =
                            document.getElementsByClassName('page-content');
            containerFlexSeparator =
                            document.getElementsByClassName('flex-separator');

            // Listeners

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

    return {}
}();
