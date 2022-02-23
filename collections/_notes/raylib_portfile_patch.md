---
#
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


layout: note
# layout: post

title: Live copy of vcpkg patch for raylib
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
date: 2022-02-22 21:50 -0300
# If it was edited, put the date here
# edit:

# Space separated tags
tags: linux vcpkg vs code raylib ubuntu portfile

# Set to add KaTeX support in the html
equations: false

# Table Of Contents
toc: false
---

This file is a copy of the `portfile.cmake` file needed for patching vcpkg.
For more information, see the
[main blog post][related-blog-post]{:target="_blank"}

If you just want to download the file, 
[click here][assets-raylib-portfile]{:target="_blank"}

<!--more-->

~~~ cmake
message("

###################################
#  Patched by Martin E. Zahnd :)  #
###################################

Patch notes:
- Removed DBUILD_GAMES, DSHARED, DSTATIC deprecated options. Replaced by DBUILD_SHARED_LIBS
- Removed ENABLE_ASAN, ENABLE_UBASAN, ENABLE_MSAN options. Could not build with them.


")

if(VCPKG_TARGET_IS_OSX OR VCPKG_TARGET_IS_LINUX)
    message(
    "raylib currently requires the following libraries from the system package manager:
    libgl1-mesa-dev
    libx11-dev
    libxcursor-dev
    libxinerama-dev
    libxrandr-dev
These can be installed on Ubuntu systems via sudo apt install libgl1-mesa-dev libx11-dev libxcursor-dev libxinerama-dev libxrandr-dev"
    )
endif()

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO raysan5/raylib
    REF 4.0.0
    SHA512 e9ffab14ab902e3327202e68ca139209ff24100dab62eb03fef50adf363f81e2705d81e709c58cf1514e68e6061c8963555bd2d00744daacc3eb693825fc3417
    HEAD_REF master
)

string(COMPARE EQUAL "${VCPKG_LIBRARY_LINKAGE}" "dynamic" BUILD_USING_SHARED_LIBS)

vcpkg_check_features(OUT_FEATURE_OPTIONS FEATURE_OPTIONS
    FEATURES
        hidpi SUPPORT_HIGH_DPI
        use-audio USE_AUDIO
)

vcpkg_cmake_configure(
    SOURCE_PATH ${SOURCE_PATH}
    PREFER_NINJA
    OPTIONS
        -DBUILD_EXAMPLES=OFF
        -DBUILD_SHARED_LIBS=${BUILD_USING_SHARED_LIBS}
        -DUSE_EXTERNAL_GLFW=OFF # externl glfw3 causes build errors on Windows
        ${FEATURE_OPTIONS}
)

vcpkg_cmake_install()

vcpkg_copy_pdbs()

vcpkg_cmake_config_fixup(CONFIG_PATH lib/cmake/${PORT})
vcpkg_fixup_pkgconfig()

file(REMOVE_RECURSE
    ${CURRENT_PACKAGES_DIR}/debug/include
    ${CURRENT_PACKAGES_DIR}/debug/share
)

if(VCPKG_LIBRARY_LINKAGE STREQUAL dynamic)
    vcpkg_replace_string(
        ${CURRENT_PACKAGES_DIR}/include/raylib.h
        "defined(USE_LIBTYPE_SHARED)"
        "1 // defined(USE_LIBTYPE_SHARED)"
    )
endif()

file(INSTALL "${SOURCE_PATH}/LICENSE" DESTINATION "${CURRENT_PACKAGES_DIR}/share/${PORT}" RENAME copyright)
~~~


[related-blog-post]: /blog/2022/02/22/vcpkg_raylib.html "Instación y configuración de vcpkg, raylib y Visual Studio Code en Linux"

[assets-raylib-portfile]: /assets/collections/posts/2022/02/22/portfile.cmake "portfile.cmake"
