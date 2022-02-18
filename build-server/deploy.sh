#!/usr/bin/bash

#   Copyright 2022 Martín E. Zahnd
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       https://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.


SCRIPT_DIR="$(dirname ${BASH_SOURCE[0]})"

readonly TMP_FOLDER=$(mktemp -d)

# Script for building
readonly BUILD_FILE='build.sh'
#
readonly PRODUCTION_DIR='_site'


readonly BUILD_TIME="$(date --rfc-3339=seconds)"


function report_abort() {
    echo -e "\e[31mDeploying ABORTED\e[0m"
    exit 1
}

function build() {
    # Make sure we are in the script directory
    pushd "${SCRIPT_DIR}" &> /dev/null || report_abort

    # Build the site
    if ! /usr/bin/bash "$BUILD_FILE"; then
        echo "Build failed"
        popd &> /dev/null
        report_abort
    fi
    popd &> /dev/null


    # Copy folder to tmp
    pushd "${SCRIPT_DIR}/../" &> /dev/null || report_abort

    cp -R "$PRODUCTION_DIR/" "$TMP_FOLDER"

    popd &> /dev/null

    return 0
}

function make_public() {
    # Parent directory for git commands
    pushd "${SCRIPT_DIR}/../" &> /dev/null || report_abort

    
    echo -e "\e[1m\e[34m[ GIT ]\e[0m"

    if git checkout gh-pages; then
        echo -e "\e[34mSwitched to branch gh-pages\e[0m"

        # Preview files before deletion
        if git rm -rf --dry-run . ; git rm -rf . ; then

            cp -rT "$TMP_FOLDER/$PRODUCTION_DIR"  .

            if git add -A && git commit -a -m "Deploy $BUILD_TIME"; then
                echo  -e "\e[32mOk\e[0m"
            else     
                echo  -e "\e[31mERROR\e[0m adding and commiting changes"
                git checkout main
                report_abort
            fi
        else
            echo  -e "\e[31mERROR\e[0m running git rm -rf"
            git checkout main
            report_abort
        fi
    else
        echo  -e "\e[31mERROR\e[0m could not switch to branch gh-pages"
        report_abort
    fi

    git checkout main
    popd &> /dev/null

    return 0
}

echo -e "\e[1mCreated folder ${TMP_FOLDER}\e[0m"
echo ""

build && make_public

rm -R "${TMP_FOLDER}"

exit 0
