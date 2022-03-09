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


# layout: note
layout: post

title: Instación y configuración de vcpkg, raylib y Visual Studio Code en Linux
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
date: 2022-02-22 21:50 -0300
# If it was edited, put the date here
edit: 2022-03-09 00:16 -0300

# Space separated tags
tags: linux vcpkg vs code raylib ubuntu

# Set to add KaTeX support in the html
equations: false

# Table Of Contents
toc: true
---


En este artículo detallo cómo instalar vcpkg, raylib y Visual Studio Code en
Ubuntu para cursar durante el primer cuatrimestre del 2022 la materia 
Algoritmos y Estructuras de Datos (22.08) del Instituto Tecnológico de
Buenos Aires.

<!--more-->

# Aclaración inicial

Todos los comandos en este tutorial deben ser ejecutados como un usuario 
normal (es decir, como un *no* super usuario). 

Si algún comando requiere privilegios elevados será indicado oportunamente o
utilizará `sudo`.
Este artículo fue escrito y probado utilizando Ubuntu 22.04 LTS y Arch Linux.

# Paquetes necesarios

Necesitamos varios paquetes. Están todos en este único comando para no 
preocuparnos por ello más adelante.

## Ubuntu

Si estamos utilizando **Ubuntu** y derivados instalamos los siguientes paquetes:

~~~ bash
sudo apt update
sudo apt install build-essential pkg-config cmake git curl zip unzip tar libgl1-mesa-dev libx11-dev libxcursor-dev libxinerama-dev libxrandr-dev libxi-dev libasound2-dev mesa-common-dev xorg-dev libglu1-mesa-dev libglfw3-dev
~~~

- **build-essential**, **pkg-config**, **cmake**: Herramientas de compilación
básicas que se utilizarán a lo largo del cuatrimestre.
- **git**: Lo necesitamos para crear, clonar y manipular repositorios.
- **curl**, **zip**, **unzip**, **tar**: Dependencias de vcpkg. 
[^vcpkg-dependencies]
- **libgl1-mesa-dev**, **libx11-dev**, **libxcursor-dev**, **libxinerama-dev**,
**libxrandr-dev**, **libxi-dev**, **libasound2-dev**, **mesa-common-dev**,
**xorg-dev**, **libglu1-mesa-dev**: Dependencias de raylib. 
[^raylib-dependencies]
- **libglfw3-dev**: Biblioteca para OpenGL. La necesitamos para algunos levels.


## Arch Linux

En **Arch Linux** y derivados:

~~~bash
sudo pacman -Syu
sudo pacman -S base-devel cmake git curl zip unzip tar glfw-x11 glfw-wayland libx11 libxcursor libxinerama libxrandr ninja vulkan-headers xorg-server-devel xorg-xinput
~~~

- **base-devel**, **cmake**: Herramientas de compilación básicas que se
utilizarán a lo largo del cuatrimestre.
- **git**: Lo necesitamos para crear, clonar y manipular repositorios.
- **curl**, **zip**, **unzip**, **tar**: Dependencias de vcpkg. 
[^vcpkg-dependencies]
- **libx11**, **libxcursor**, **libxinerama**, **libxrandr**, **ninja**,
**vulkan-headers**, **xorg-server-devel**, **xorg-xinput**: Dependencias
de raylib. [^raylib-dependencies]
- **glfw-x11**, **glfw-wayland**: Biblioteca para OpenGL. La necesitamos para
algunos levels.

[^vcpkg-dependencies]:
    Del [repositorio oficial en
    GitHub][vcpkg-docs-linux-dev-tools]{:target="_blank"}

[^raylib-dependencies]:
    Al compilar raylib obtenemos el siguiente mensaje:
    ~~~
    raylib currently requires the following libraries from the system package
    manager:
        libgl1-mesa-dev
        libx11-dev
        libxcursor-dev
        libxinerama-dev
        libxrandr-dev
    These can be installed on Ubuntu systems via sudo apt install 
    libgl1-mesa-dev libx11-dev libxcursor-dev libxinerama-dev libxrandr-dev
    ~~~
    Además, en la [Wiki del repositorio
    oficial][raylib-docs-gnu]{:target="_blank"} nos dicen que
    > You need to install some required libraries; ALSA for audio, Mesa for
    OpenGL accelerated graphics and X11 for windowing system.


# vcpkg

Instalemos el gestor de paquetes que vamos a utilizar durante la cursada.

Para ello, ejecutamos los siguientes comandos:

~~~ bash
mkdir ~/dev && cd ~/dev
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg/
./bootstrap-vcpkg.sh
./vcpkg integrate install
./vcpkg integrate bash
~~~

Con estos comandos estamos:

- `mkdir ~/dev && cd ~/dev`: Creando (y luego accediendo) a la carpeta `dev` 
en nuestro `$HOME`.
- `git clone ...`: Obteniendo el código fuente de vcpkg del repositorio 
oficial.
- `bootstrap-vcpkg.sh`: Instalando vcpkg.
- `./vcpkg integrate install`: ''Integrando'' las bibliotecas.
[^vcpkg-integrate-install]
- `./vcpkg integrate bash` Agregando autocompletado al presionar tab. Si 
nuestra shell es zsh podemos reemplazar `bash` por `zsh` en este comando.
[^vcpkg-integrate-autocompletion]

[^vcpkg-integrate-install]:
    De [la documentación oficial][vcpkg-docs-integration]{:target="_blank"}:
    > This will implicitly add Include Directories, Link Directories, and Link 
    Libraries for all packages installed with Vcpkg to all VS2015, VS2017 and
    VS2019 MSBuild projects. We also add a post-build action for executable
    projects that will analyze and copy any DLLs you need to the output folder,
    enabling a seamless F5 experience.

[^vcpkg-integrate-autocompletion]:
    Ver [la documentación
    oficial][vcpkg-docs-tab-autocompletion]{:target="_blank"}.

> **¡IMPORTANTE!**
>
> Prestemos atención a que todos los comandos de vcpkg están siendo ejecutados
desde la carpeta donde fue instalado de la siguiente manera:
`./vcpkg <comando>`.
>
> Si quisiéramos ejecutar el gestor desde 'cualquier carpeta' deberíamos 
agregarlo a nuestro `$PATH`.

## Instalando raylib

En Ubuntu, instalar raylib utilizando el archivo de vcpkg que viene por 
defecto trae *muchos* problemas al momento de compilar el programa. Para
solucionarlos, modifiqué el archivo con las instrucciones de instalación de
la biblioteca para vcpkg.

Vamos a reemplazar el archivo `portfile.cmake` original de raylib en vcpkg con
la versión modificada. [^vcpkg-raylib-portfile]


Para ello, primero descargamos el nuevo `portfile.cmake` desde 
[este link][assets-raylib-portfile]{:target="_blank"}
(haciendo click derecho sobre el link -> Guardar cómo...) y lo guardamos en
un lugar de fácil acceso, por ejemplo, la carpeta `~/dev/` que creamos al
principio. [^portfile-live]

[^portfile-live]:
    También podemos [ver una copia en este
    sitio][notes-raylib-portfile-live]{:target="_blank"} antes de descargarlo.


> Como tenemos disponible cURL, podemos copiar la url del archivo modificado
(de nuevo, haciendo click derecho sobre el link -> Copiar dirección) y
ejecutando el siguiente comando desde nuestra terminal, reemplazando
`<url a portfile.cmake>` apropiadamente.
>
> ~~~ bash
curl -o ~/dev/vcpkg/ports/raylib/portfile.cmake <url a portfile.cmake>
~~~
>
> Si hacemos esto, podemos omitir el paso a continuación.

[^vcpkg-raylib-portfile]:
    Si en el futuro deja de ser necesario este parche, podemos reestablecer
    los archivos originales de vcpkg descargándolos desde [su ubicación en
    el repositorio de GitHub][vcpkg-raylib-port-gh]{:target="_blank"} 
    y reinstalando raylib.


[vcpkg-raylib-port-gh]: https://github.com/microsoft/vcpkg/tree/master/ports/raylib "microsoft/vcpkg/ports/raylib/"

Ahora, desde una terminal, reemplazamos el archivo original con nuestra 
versión:

~~~ bash
cd ~/dev/vcpkg
# Cambiar porfile.cmake por la dirección donde descargamos el archivo.
mv portfile.cmake ~/dev/vcpkg/ports/raylib/portfile.cmake
~~~

Y procedemos, ahora sí, a instalar raylib con vcpkg:

~~~ bash
./vcpkg install raylib
~~~

# Visual Studio Code

## Instalación

La manera más rápida de instalar el editor de texto es entrar a la sección de
descargas del [sitio oficial de Visual Studio
Code][vscode-downloads]{:target="_blank"}, descargar el archivo `.deb` y
ejecutar en una terminal: [^vscode-setup]

~~~ bash
cd ~/Downloads  # Cambiar por la ubicación donde se descargó el archivo
sudo apt install ./code_<version>.deb
~~~

[^vscode-setup]:
    Ver [la documentación al respecto][vscode-docs-setup]{:target="_blank"}.


## Extensiones

Para poder utilizar C/C++ y CMake de manera amigable en Visual Studio Code,
instalaremos la extensión [C/C++ Extension
Pack][vscode-ccpp-extension]{:target="_blank"}.

Para ello, vamos al menú de extensiones, desde el botón ubicado en la barra 
lateral izquierda o presionando `Ctrl+Shift+X` y buscamos la extensión por
su nombre. También podemos entrar a su
[página en Visual Studio
Marketplace][vscode-ccpp-extension]{:target="_blank"} e instalarla
mediante el comando provisto.

## CMake

### Configuración global
Una vez instalado VS Code, abrimos el archivo de configuración.

Para ello, abrimos la paleta de comandos presionando `Ctrl+Shift+P` y
seleccionamos `Preferences: Open Settings (JSON)` en el menú  que nos aparece. 

> Tip
>
> Podemos escribir `settings json` para reducir las opciones.

Si la instalación es reciente, veremos un archivo vacío con un contenido 
similar al siguiente:

~~~ json
{
    "workbench.colorTheme": "Default Dark+"
}
~~~

Entre las llaves (`{ }`), agregamos la siguiente línea de código:
[^vscode-vcpkg-cmake]

~~~ json
,"cmake.configureSettings": {
"CMAKE_TOOLCHAIN_FILE": "~/dev/vcpkg/scripts/buildsystems/vcpkg.cmake"
}
~~~

[^vscode-vcpkg-cmake]:
    Ver [la documentación oficial][vcpkg-docs-cmake]{:target="_blank"}.

Obteniendo un resultado similar al siguiente:

~~~ json
{
    "workbench.colorTheme": "Default Dark+"
    ,"cmake.configureSettings": {
        "CMAKE_TOOLCHAIN_FILE": "~/dev/vcpkg/scripts/buildsystems/vcpkg.cmake"
    }
}
~~~

### Configuración por proyecto

Para trabajar más cómodos en VS Code, cuando iniciamos un proyecto podemos
abrir la paleta de comandos y ejecutar `CMake: Configure` para que nos cree
un archivo `CMakeLists.txt` y configure archivos extras en la carpeta `build`.


# Probando... probando...

Crear una nueva carpeta para nuestro proyecto de prueba y la abrimos con
Visual Studio Code.

> Tip
> 
> Si estamos en una terminal podemos abrir una carpeta con VS Code directamente
utilizando `code <path>`.
En particular, si estamos posicionados en la carpeta donde vamos a crear
nuestro proyecto de prueba utilizamos `code .` para abrir el editor.

Crearemos dos archivos: `main.cpp` y `CMakeLists.txt` con el siguiente 
contenido:

`main.cpp`:

~~~ cpp
// main.cpp
// Raylib [core] example
// Copyright (C) 2013-2016 Ramon Santamaria (@raysan5)

#include <raylib.h>

int main(void) {
    const int screenWidth = 800;
    const int screenHeight = 450;

    InitWindow(screenWidth, screenHeight,
            "raylib [core] example - basic window");

    SetTargetFPS(60);

    // Game loop
    while (!WindowShouldClose())
    {
        BeginDrawing();
        
        ClearBackground(RAYWHITE);

        DrawText("Congrats! You created your first window!",
                190, 200, 20, LIGHTGRAY);

        EndDrawing();
    }

    CloseWindow();

    return 0;
}
~~~

`CMakeLists.txt`:

~~~ cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.0.0)
project(raylib-example VERSION 0.1.0)

# From "Working with CMake" documentation:
if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
    set(CMAKE_CXX_STANDARD 11)
    add_compile_options(-fsanitize=address)
    add_link_options(-fsanitize=address)
endif()


add_executable(${PROJECT_NAME} main.cpp)


# Raylib
find_package(raylib CONFIG REQUIRED)

if(${CMAKE_SYSTEM_NAME} MATCHES "Windows")
    target_include_directories(${PROJECT_NAME} PRIVATE ${RAYLIB_INCLUDE_DIRS})
    target_link_libraries(${PROJECT_NAME} PRIVATE ${RAYLIB_LIBRARIES})
elseif(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
    target_link_libraries(${PROJECT_NAME} PRIVATE raylib)
elseif(${CMAKE_SYSTEM_NAME} MATCHES "Linux")
    target_link_libraries(${PROJECT_NAME} PRIVATE raylib m ${CMAKE_DL_LIBS} pthread GL rt X11)
endif()


# From "Working with CMake" documentation:
if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
    target_link_libraries(main PRIVATE "-framework IOKit")
    target_link_libraries(main PRIVATE "-framework Cocoa")
    target_link_libraries(main PRIVATE "-framework OpenGL")
endif()
~~~

La línea de configuración

~~~ cmake
target_link_libraries(main PRIVATE raylib m ${CMAKE_DL_LIBS} pthread GL rt X11)
~~~

es necesaria en Linux para indicarle al linker que debe utilizar las bibliotecas
especificadas (raylib, math, pthread, etc).[^more-platforms-cmake]

[^more-platforms-cmake]:
    Podemos obtener una lista de las distantas plataformas
    [en este artículo][cmake-platform-checks-vars]{:target="_blank"}.




Para compilar nuestro proyecto de prueba, podemos presionar la tecla `F7` y,
una vez compilado, `Shift+F5` para ejecutarlo.





[assets-raylib-portfile]: /assets/collections/posts/2022/02/22/portfile.cmake "portfile.cmake"

[notes-raylib-portfile-live]: /notes/raylib_portfile_patch.html "Live copy of vcpkg patch for raylib"




[vcpkg-docs-linux-dev-tools]: https://github.com/microsoft/vcpkg/blob/master/README.md#installing-linux-developer-tools "microsoft/vcpkg: Installing Linux Developer Tools"

[vcpkg-docs-cmake]: https://github.com/microsoft/vcpkg/blob/master/README.md#visual-studio-code-with-cmake-tools "microsoft/vcpkg: Using vcpkg with CMake / Visual Studio Code with CMake Tools"

[vcpkg-docs-tab-autocompletion]: https://github.com/microsoft/vcpkg#tab-completionauto-completion "microsoft/vcpkg: Tab-Completion/Auto-Completion"

[vcpkg-docs-integration]: https://github.com/microsoft/vcpkg/blob/master/docs/users/integration.md#user-wide-integration "microsoft/vcpkg: Buildsystem Integration / User-wide integration"



[raylib-docs-gnu]: https://github.com/raysan5/raylib/wiki/Working-on-GNU-Linux "raysan5/raylib: Working on GNU Linux"


[vscode-downloads]: https://code.visualstudio.com/Download "Download Visual Studio Code"

[vscode-docs-setup]: https://code.visualstudio.com/docs/setup/linux "Visual Studio Code on Linux"

[vscode-ccpp-extension]: https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools-extension-pack "Visual Studio Marketplace: C/C++ Extension Pack"



[cmake-platform-checks-vars]: https://gitlab.kitware.com/cmake/community/-/wikis/doc/tutorials/How-To-Write-Platform-Checks#platform-variables "How To Write Platform Checks: Platform Variables"


