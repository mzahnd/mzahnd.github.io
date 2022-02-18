#!/bin/bash

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


# Enter parent directory before sourcing anything
SCRIPT_DIR="$(dirname ${BASH_SOURCE[0]})"
pushd "${SCRIPT_DIR}/../" &> /dev/null || exit 1


readonly OUTPUT_DIR='_site'


echo -e "\e[1m\e[34m[ BUILD ]\e[0m"


# Sass

echo -e "\e[1m\e[35m( Sass )\e[0m"
if sass --color --trace --verbose   \
    -I sass sass/:css/              \
    --no-source-map --style=compressed; then
    echo ""
    echo -e "Sass \e[32mOK\e[0m"
else
    echo ""
    echo -e "Sass \e[31mFailed\e[0m"
    exit 1
fi

cp _css/*.css css/

echo ""



# Jekyll

echo -e "\e[1m\e[35m( Jekyll )\e[0m"

mv "${OUTPUT_DIR}" "_old_${OUTPUT_DIR}"

if jekyll build --trace -d "${OUTPUT_DIR}"; then
    echo ""
    echo -e "Jekyll \e[32mOK\e[0m"
else
    echo ""
    echo -e "Jekyll \e[31mFailed\e[0m"
    exit 1
fi

echo ""

rm -rf "_old_${OUTPUT_DIR}"
touch "${OUTPUT_DIR}/.nojekyll"


# Exit script directory
popd &> /dev/null

exit 0
