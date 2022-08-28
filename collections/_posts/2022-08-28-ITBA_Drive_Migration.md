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

title: Migrando 1.3 TiB de datos en Google Drive
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
date: 2022-08-28 09:34:38 -0300
# If it was edited, put the date here
# edit:

# Space separated tags
tags: google drive, google, drive, itba, ceitba, cs, computer society

# Set to add KaTeX support in the html
equations: false

# Table Of Contents
toc: true
---

La aventura para salvar el centenar de apuntes que colectivamente crearon los alumnos comenzó el
24 de mayo del 2022 cuando todos recibimos el mismo mail:
![mail-ti]
> **Transcripción**
>
> Espacio en tu cuenta ITBA
>
> Estimada Comunidad
> 
> Google ha comunicado que dejará de ofrecer almacenamiento ilimitado a entidades educativas.
> 
> Por lo tanto, a partir del 1° de julio, todas las cuentas @itba.edu.ar tendrán un límite de 40 GB
> de almacenamiento, que se comparten entre Google Drive (incluyendo unidades compartidas), Gmail,
> Google Fotos y toda aplicación dentro de Google. Recomendamos revisar sus carpetas y eliminar los
> archivos viejos o en desuso para liberar espacio.
> 
> Quienes superen su límite de almacenamiento no perderán nada. Sin embargo, no podrás guardar 
> archivos nuevos en Google Drive, ni fotos o videos nuevos en Google Fotos, como tampoco recibir 
> correos electrónicos en su dirección de Gmail.
> 
> En nuestra intranet pueden encontrar más información.
> 
> Tecnología de la Información

[mail-ti]: /assets/collections/posts/2022-08-28-ITBA_Drive_Migration-MailTI.png "Mail del departamento de Tecnología de la Información"
{: width="651px"}


<!--more-->

# La organización

A los pocos días de recibido el correo comenzó a circular un grupo de Telegram creado para organizarnos con el copiado de los archivos.

Tras discutir varias propuestas, el consenso general fue que primero debíamos comenzar a descargar todo lo posible, y mientras lo hacíamos definir con mayor precisión qué hacer con los apuntes.

Se creó una planilla de cálculo compartida con una lista de carpetas en Google Drive que nos parecía importante copiar y se hizo pública para que todos pudieran completarla si olvidábamos alguna.

# El proceso de descarga

## ¿De cuánta información estamos hablando?

La pregunta que surgió inmediatamente fue ¿cuánto espacio necesitábamos realmente para copiar todos los apuntes compartidos? ¿500 GiB? ¿1 TiB? ¿2? ¿más?.

Resulta que Google Drive no informa a sus usuarios cuánto ocupa cada carpeta, solamente lo hace con archivos individuales, con lo cual, a priori, era imposible estimar el almacenamiento total que necesitábamos.

Algunos compañeros decidieron escribir un script en Python usando Google Colaboratory para calcular el tamaño de las carpetas, lo cual funcionó muy bien, pero no utilizaron su código con todas las carpetas que teníamos que descargar pues la lista continuó creciendo durante los días posteriores.

Cuando un tiempo después noté que la lista había dejado de crecer y conseguí un poco de tiempo libre, me propuse completar el cómputo del tamaño de los apuntes con las carpetas restantes.
En ese momento me surgió la duda _¿habrá algún modo de hacer esto con [rclone][rclone]?_.
Treinta segundos de búsqueda en internet me dieron la respuesta: sí, se puede hacer utilizando [`rclone size`][rclone-size].

Y funcionó a la perfección... casi.
El único detalle que debí tener en cuenta fue ignorar los accesos directos dentro de las carpetas.
Muchas carpetas resultaron tener accesos circulares, por lo que al querer calcular el tamaño de una carpeta, por ejemplo "Apuntes Tincho", entraba a otra, "Apuntes ITBA", que a su vez tenía acceso a la primera, creando un ciclo interminable del cual rclone no se percataba.

![cyclic-shortcuts]

> **Nota técnica**
>
> El comando final resultó ser:
>
> ~~~ bash
> rclone size remote:folder --drive-skip-shortcuts --drive-skip-dangling-shortcuts
> ~~~

En la lista compartida de carpetas que creamos, agregué el tamaño de las carpetas restantes, resultando en un total de 1.6 TiB, y continué con el siguiente paso.

## Descargando más de 1 TiB de Google Drive

Para ahorrar tiempo y la cantidad de espacio libre que cada uno necesitaba, nos dividimos las tareas de acuerdo al espacio libre que cada uno tuviera a disposición en discos externos y lo que cada uno consideraba "prioritario" para su carrera (así, alumnos de ingeniería electrónica descargaron principalmente el contenido de esa carrera; mientras los de informática priorizamos el de la nuestra, etc).
De todos modos, al final terminamos descargando material cruzado y logrando tener varias copias de lo mismo repartidas en varios discos.

En particular, aprovechando que tenía a mí disposición varios discos duros de 1 TiB vacíos, un par de adaptadores SATA-USB y una Raspberry Pi 4, terminé descargando material de todas las carreras excepto de ingeniería electrónica: cerca de 1.3 TiB de información.

Para realizar todo el proceso de descarga y subida de archivos usamos la maravillosa herramienta [rclone][rclone], _"la navaja suiza del almacenamiento en la nube"_. [^rclone-swiss-army-knife]

[^rclone-swiss-army-knife]:
    De la sección ["About rclone"][rclone-about]{:target="_blank"}:
    >    Users call rclone "The Swiss army knife of cloud storage", and "Technology 
    indistinguishable from magic".

En mí servidor de juguete tenía un script escrito en Bash para subir archivos utilizando rclone, con lo cual me ahorré alguna parte del trabajo.

> **Nota técnica**
>
>    Script escrito en Bash para ejecutar rclone y descargar carpetas de Google Drive.
> Cuando llegó el momento de subir la información nuevamente use el mismo script con mínimas
> modificaciones.
>
>~~~bash
>#!/bin/bash
>
>readonly me="${0##*/}"
>
># Do not try to sync if already doing it :)
>if pidof -o %PPID -x "$me"; then
>    exit 0
>fi
>
># ====== VARIABLES ======
>
>readonly _RCLONE_HOME='/home/trinity/apuntes/'
>readonly _RCLONE_LOCAL_FOLDER='/mnt/apuntes-itba/apuntes/Apuntes-ITBA/'
>readonly _RCLONE_REMOTE_FOLDER='apuntes-itba:'
>readonly _RCLONE_EXCLUDE="${_RCLONE_HOME}/exclude-file.txt"
>_RCLONE_CACHE="/cache/"
>
># export RCLONE_CONFIG_PASS=''
>
># ====== TRAP ======
>trap "echo [$(date --rfc-3339='seconds')] Interrupted. >&2; exit 2" INT TERM
>
># ====== FUNCTIONS ======
>
>function log_info()
>{
>    printf "[%s] %s\n" "$(date --rfc-3339='seconds')" "$*" >&2;
>}
>
>function cache_dir()
>{
>    local cache=$(mktemp -d)
>
>    _RCLONE_CACHE="${cache}/${_RCLONE_CACHE}"
>
>    mkdir -p "$_RCLONE_CACHE"
>}
>
>function clone()
>{
>    local rclone_return=0
>
>    log_info "Running..."
>
>        # --bwlimit "00:30,off 06:30,1M:3.125M 08:00,512k:1M 23:30,512K:2M"   \
>    rclone copy "$_RCLONE_REMOTE_FOLDER" "$_RCLONE_LOCAL_FOLDER"            \
>        --dry-run                                                           \
>        --config "${_RCLONE_HOME}/rclone.conf"                              \
>        --cache-dir "${_RCLONE_HOME}/cache/"                                \
>        --checksum                                                          \
>        --delete-after                                                      \
>        --error-on-no-transfer                                              \
>        --human-readable                                                    \
>        --exclude-from "${_RCLONE_EXCLUDE}"                                 \
>        --log-file "${_RCLONE_HOME}/log-${me%%.*}.txt"                      \
>        --log-level INFO                                                    \
>        --drive-skip-shortcuts                                              \
>        --drive-skip-dangling-shortcuts                                     \
>        --bwlimit "00:30,off 06:30,1M:3.125M 08:00,512k:1M 23:30,512K:2M"   \
>        --update
>    rclone_return=$?
>
>    if [ $rclone_return -eq 9 ]; then
>        rclone_return=0
>        log_info "Operation successful. No files transferred."
>    else
>        log_info "Operation finished with exit code: $rclone_return"
>    fi
>
>    return $rclone_return
>}
>
># ====== MAIN ======
>
>cache_dir
>
>clone
>
>rm -R "${_RCLONE_CACHE}"
>
>exit $?
>~~~


[cyclic-shortcuts]: /assets/collections/posts/2022-08-28-ITBA_Drive_Migration-Cyclic_shortcuts.png
{: height="161px" width="651px"}

[rclone]: https://rclone.org/ "Rclone homepage"
[rclone-size]: https://rclone.org/commands/rclone_size/ "Rclone size command"
[rclone-about]: https://rclone.org/#about "About rclone"


# Unificando los apuntes

Decidimos unir todo el conocimiento acumulado por alumnos y ex-alumnos en una  única carpeta de
apuntes, donde todos pudieran seguir aportando material y obtenerlo sin buscar en una decena de
lugares diferentes, como ocurría hasta antes de la fecha.

## Organización y estructura

Al final elegimos utilizar la siguiente estructura para la carpeta unificada:

~~~plain
Apuntes
├── 0-Ingreso
├── 1-Materias
│   ├── 12.34 - Materia interesante
│   │   ├── Apuntes
│   │   ├── Examenes
│   │   │   ├── 1er Parcial
│   │   │   ├── 2do Parcial
│   │   │   └── Finales
│   │   ├── Guías
│   │   ├── Laboratorio
│   │   └── Videos
│   ├── 12.35 - Otra materia
│   │   └── ...
│   └── ...
├── 2-Ingeniería
│   ├── Ingeniería Electrónica
│   │   ├── 12.34 - Materia interesante -> Apuntes/1-Materias/12.34 - Materia interesante
│   │   ├── ...
│   │   └── 93.05 - Más materias -> Apuntes/1-Materias/93.05 - Más materias
│   ├── Ingeniería Informática
│   │   └── ...
│   ├── ...
│   └── Ingeniería Química
│   │   └── ...
├── 3-Licenciatura
│   ├── Analítica Empresarial y Social
│   │   ├── 12.34 - Materia interesante -> Apuntes/1-Materias/12.34 - Materia interesante
│   │   ├── ...
│   │   └── 93.05 - Más materias -> Apuntes/1-Materias/93.05 - Más materias
│   └── Gestión de Negocios
│   │   └── ...
└── License, disclaimer, readme, etc.
~~~

Es más simple de lo que parece: la carpeta principal contiene algunos archivos con la licencia, un
disclaimer, etc; los alumnos de ingreso tienen una carpeta exclusiva para ellos (llamada 
`0-Ingreso`); y las carreras de ingeniería (`2-Ingeniería`) y licenciatura (`3-Licenciatura`)
tienen accesos directos a las distintas materias (que residen en `1-Materias`).

Por ejemplo, un alumno de la carrera _Ingeniería Electrónica_ podría acceder a las materias de 
código `12.34` y `93.05` desde la carpeta de la carrera que estudia o desde la carpeta de materias.
~~~plain
...
│ 
├── 2-Ingeniería
│   ├── Ingeniería Electrónica
│   │   ├── 12.34 - Materia interesante -> Apuntes/1-Materias/12.34 - Materia interesante
│   │   ├── ...
│   │   └── 93.05 - Más materias -> Apuntes/1-Materias/93.05 - Más materias
│   ...
~~~

_¿Por qué tomamos la decisión de utilizar accesos directos?_
Resulta que todas las carreras comparten al menos una materia entre sí, y la idea detrás de la
unificación es disminuir la cantidad de material repetido y centralizar su búsqueda.
La manera más simple y de menor mantenimiento son los accesos directos: lo único que se debe
mantener actualizada es la materia en sí misma.

A su vez, la carpeta `1-Materias`, la más interesante de todas, tiene, como ya dijimos, las
materias de todas las carreras de la universidad nombradas como 
`<código-de-la-materia> - <nombre-de-la-materia>`
(por ejemplo: `22.08 - Algoritmos y Estructura de Datos`), y cada materia contiene el material 
discriminado por su tipo: "Apuntes", "Exámenes", "Guías", etc.
~~~plain
│   ...
├── 1-Materias
│   ├── 22.08 - Algoritmos y Estructura de Datos
│   │   ├── Apuntes
│   │   ├── Exámenes
│   │   │   ├── 1er Parcial
│   │   │   ├── 2do Parcial
│   │   │   └── Finales
│   │   ├── Guías
│   │   ├── Laboratorio
│   │   └── Videos
│   ...
~~~

## Creando 301 carpetas de materias

¿Cómo creamos y estructuramos la carpeta de las 301 materias que se dictan en la universidad?

Son muchas carpetas para hacer a mano, por lo que la respuesta fue escribir un pequeño código que
haga el trabajo por nosotros.

Tras conseguir un archivo con la información básica de cada materia, que se veía más o menos 
así:
~~~json
[
  {
    "Nombre": " Interesting subject",
    "Codigo": "12.34 ",
    "depto": {
      "Nombre": "Department of interesting subjects, ofc"
    }
  },
  {
    "Nombre": " Algoritmos y Estructura de Datos",
    "Codigo": "22.08 ",
    "depto": {
      "Nombre": "Electrónica"
    }
  },
]
~~~

Escribí en pocos minutos un simple script en Python que crease las carpetas con su respectiva
estructura.

> **Nota técnica**
> 
> Script para crear el árbol de carpetas y subcarpetas.
>
> ~~~python
> #!/usr/bin/python3
> 
> import json
> from os import mkdir, makedirs
> 
> # JSON with subjects names and code.
> # Assumed format: An array of subject-objects
> # 
> # [
> #   {
> #     "Nombre": " Administración de Recursos Humanos",
> #     "Codigo": "94.27 ",
> #     "depto": {
> #       "Nombre": "Economía y Desarrollo Profesional"
> #     }
> #   },
> # ]
> JSON_MATERIAS='MateriasDump.json'
> 
> # Where all subjects should be created
> FOLDER_ROOT='./Materias'
> 
> # Creates this folders inside each subject folder.
> # Direct children first, grandsons later.
> FOLDER_CHILDREN=['Apuntes', 
>                   'Examenes', 
>                   'Laboratorio', 
>                   'Guías',
>                   'Videos',
>                   'Examenes/Finales', 
>                   'Examenes/1er Parcial', 
>                   'Examenes/2do Parcial', 
> ]
> 
> 
> def get_subject_names(jdump):
>     subject_names = list()
>     for subject in jdump:
>         subject_names.append(str(subject['Codigo'].strip() 
>                                  + ' - ' 
>                                  + subject['Nombre'].strip()
>                                  ))
> 
>     return subject_names
> 
> 
> def create_folders(subjects):
>     # Parent folder
>     try:
>         mkdir(FOLDER_ROOT, mode=0o755)
>     except FileExistsError:
>         pass
> 
>     for subject in subjects:
>         path = FOLDER_ROOT + '/' + subject
> 
>         for child in FOLDER_CHILDREN:
>             try:
>                 makedirs(path + '/' + child, mode=0o755)
>             except FileExistsError:
>                 pass
> 
> 
> if __name__ == '__main__':
>     with open(JSON_MATERIAS, mode='r', encoding="utf-8") as f:
>         jdump = json.loads(f.read())
>         subject_names = get_subject_names(jdump)
> 
>         create_folders(subject_names)
> 
> ~~~
>

Simple, se ejecuta en menos de un segundo y crea exactamente la estructura que precisamos.

El siguiente paso fue subir las 2709 carpetas vacías que generamos a Google Drive. 
Sorprendentemente el proceso tomó más de una hora.

> **Nota técnica**
>
> El comando utilizado fue:
>
> ~~~bash
> rclone copy Materias apuntes:1-Materias --create-empty-src-dirs --progress
> ~~~~
> 
> ¿Qué hace este comando?
> - `copy`: le pedimos a rclone que copie "archivos de la fuente al destino, omitiendo archivos idénticos" [^rclone-copy]
> - `Materias`: es la carpeta local, la "fuente".
> - `apuntes:1-Materias`: "apuntes" es la carpeta remota configurada en rclone; escrito de esta manera, la fuente es la carpeta "1-Materias" en Google Drive.
> - `--create-empty-src-dirs`: nuestra intención es crear carpetas vacías en la carpeta de Google Drive. Este flag hace exactamente eso.
> - `--progress`: muestra el progreso en pantalla.

[^rclone-copy-docs]:
    [Documentación de `rclone copy`][rclone-copy]

[rclone-copy]: https://rclone.org/commands/rclone_copy/ "Rclone copy command"

# La dulce espera

El centro de estudiantes de la universidad (CEITBA) decidió hacerse cargo de los apuntes de ahora en más, lo cual nos pareció razonable a todos por su rol en el día a día de los alumnos.

Por ello, debimos esperar varias semanas para que pudieran comprar 2 TiB de almacenamiento en 
Google Drive.
Sabiendo que estábamos en fechas de exámenes y entregas de trabajos, supimos sentarnos a esperar
con paciencia.

A pesar de la compra más tarde de lo esperado, nos las arreglamos para continuar con el proceso.

# Agregando a los alumnos

Todo subido, llegó el momento de darle acceso al resto de nuestros compañeros.

La primer idea fue crear un formulario para que se "inscriban" todos los interesados y utilizar 
[Google Apps Script][google-apps-script] sobre la planilla de cálculo que genera el formulario.

Parecía una buena idea: cada 15 minutos un temporizador de Apps Script ejecutaba el código que daba
permisos de lectura a cada usuario que haya completado el formulario.

El lector atento sabe que "parecía" significa que, al final, resultó ser un dolor de cabeza.

> **Nota técnica**
> 
> Código originalmente ejecutado cada 15 minutos por Google Apps Scripts.
>
> ~~~javascript
> function shareFolderForm() {
>   const sheet = SpreadsheetApp.getActiveSheet();
>   const folderID = "1F9lZX03o6Rdd0i3HgMZ3G5EiskgmXLfB";
>   const folderToShare = DriveApp.getFolderById(folderID);
> 
>
>   var emails = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
>   emails.shift();
>   for (i in emails){
>      Drive.Permissions.insert(
>       {
>         role: 'reader',
>         type: 'user',
>         value: emails[i][1],
>       },
>       folderID,
>       {
>         sendNotificationEmails: 'false',
>       }
>     );
>   }
> 
>   sheet.clearContents()
> }
> ~~~

El primer problema que nos encontramos fue que los usuarios se agregaban a la carpeta principal pero la veían vacía, a pesar de tener miles de archivos dentro; el segundo, que los nuevos usuarios no estaban siendo agregados siquiera a la carpeta principal.

Tomé la delantera y empecé a investigar. 
Los registros de errores del Apps Script mostraban siempre el mismo error, una y otra vez:
![apps-script-error-log]

![apps-script-error]

> **Transcripción**
>
> 4 ago 2022, 18:27:25
>
> Error
>
> GoogleJsonResponseException: API call to drive.permissions.insert failed with error: Invalid permission value at shareFolderForm(Código:11:24)

¿Qué significa esto? ¿Por qué está fallando?

Ejecutar el código "a mano" (sin esperar al temporizador) no mostraba ningún mensaje de error
nuevo o mayores detalles, pero ejecutarlo línea por línea sí: resulta que un alumno se registró
como _"pepe@gmail.com, hable con el ceitba por el @itba.edu.ar"_.
La única validación del correo electrónico ingresado se hacía en el mismo formulario, verificando
que lo escrito tuviera _"@itba.edu.ar"_, ¡y la oración anterior lo contenía! sólo que la oración
no era un mail.
Por esto y por la falta de verificación de errores en el código, cuando Google Drive intentaba
darle acceso de lectura, fallaba.

En el camino, también aprendí que Google impone un
[límite temporal de 6 minutos][apps-script-limitations] en la ejecución de un App Script, por lo
que no era una posibilidad leer una lista cada vez más larga de usuarios y darles permiso de
lectura.

Tras modificar el script para que valide los correos del formulario y agregando un manejo de 
errores simple logré que el script nos informe _"por qué falló"_ con un determinado correo pero sin
dejar de ejecutarse.

> **Nota técnica**
> 
> Script con las modificaciones mencionadas.
> 
> Además, cuenta con una función para eliminar permisos de una carpeta que menciono más adelante.
> 
> ~~~javascript
> function insertPermissions(email) {
>   const folderID = "123ABCdef"; // Apuntes CEITBA
>   var resource = {
>     value: email,
>     role: 'reader',
>     type: 'user'
>   };
> 
>   var optionalArgs = {
>     sendNotificationEmails: false,
>     supportsAllDrives: true
>   };
> 
>   try {
>     Drive.Permissions.insert(resource, folderID, optionalArgs);
>   }
> 	catch(e) {
>     console.error("Failed for mail: '" + email + "' with error: " + e);
>   }
> }
> 
> // Remove permissions for user with EMAIL
> function removePermissions(email) {
>   const folderID = "123ABCdef";
> 
>   console.log("Permissions for: " + email);
>   const permsissions = Drive.Permissions.getIdForEmail(email);
> 
>   if (permsissions.id) {
>     try {
>       Drive.Permissions.remove(folderID, permsissions.id);
>     }
>     catch(e) {
>       console.error("Failed for mail: '" + email + "' with error: " + e);
>     }
>   }
> }
> 
> function shareFolderForm() {
>   const sheet = SpreadsheetApp.getActiveSheet();
> 
>   const emailRegex = /(\w)+@itba.edu.ar/;
>
>   var emailsWithTimestamp = sheet.getDataRange().getValues();
>   emailsWithTimestamp.shift();
> 
>   for (i in emailsWithTimestamp){
> 
>     var email = emailsWithTimestamp[i][1].match(emailRegex);
>     if (email) {
>       insertPermissions(email[0].toString().toLowerCase());
>     }
>   }
> 
>   // Delete already parsed rows.
>   // This loop runs in reverse order to avoid skipping rows.
>   emailsWithTimestamp.reverse().forEach((row, idx) => {
>     // deleteRow() starts at 1, at the same time, idx starts at 0, length is >= 0
>     // and we made a shift before after declaring emailsWithTimestamp,
>     // For all this, we add one to rowNumber.
>     var rowNumber = emailsWithTimestamp.length - idx + 1;
>     sheet.deleteRow(rowNumber);
>   })
> }
> ~~~

Ahora teníamos un script que funcionaba correctamente pero seguíamos con el problema original: 
agregábamos a un nuevo alumno y no podía ver el contenido de las carpetas o, más extraño aún, veía 
algunas carpetas y otras no (y esto no era consistente entre todos los usuarios).

Afortunadamente, mí compañero autor del código original para automatizar el formulario le comentó
su problema a una amiga quien nos reveló el camino a seguir: Google Groups.

Tras jugar un poco con esta herramienta, aprendimos Google Groups crea un correo
"@googlegroups.com" y este mail se puede utilizar para dar permisos a todos los miembros del grupo
en simultáneo. Si uno tiene acceso, todos lo tienen.
También aprendimos que, si bien podíamos crear grupos desde cualquier cuenta de Google, solamente 
se puede automatizar el agregado de nuevos miembros con una cuenta
[Google Workspace][google-workspace].

Como queríamos simplificar el problema y dehacer el nudo de permisos innecesarios creados por usar
el script decidimos hacer lo que debimos hacer desde un comienzo (qué fácil es decirlo ahora):
detenernos a pensar.

Resulta que nuestra universidad utiliza Google Groups para crear grupos de alumnos y enviarnos 
mails a todos al mismo tiempo. 
Así que la solución fue tan simple como compartir nuestra carpeta de apuntes con el mail del 
alumnado que gestiona el ITBA y esperar que Google Drive aplique los cambios en cada carpeta y cada
archivo (lo cual, sorprendentemente, tomó más de una semana). 
Lo mismo hicimos con los alumnos de ingreso y un pequeño grupo de "administradores", encargados de
mantener la carpeta de apuntes, que creamos y gestionamos desde la cuenta del centro de
estudiantes.

Como extra, utilizar los grupos que creó el ITBA nos da la ventaja de que el mantenimiento es nulo 
desde nuestro punto de vista: la universidad se encarga de actualizar la lista de alumnos cada 
cuatrimestre y Google hace el trabajo de relacionar los permisos del grupo con cada usuario del
mismo.

En paralelo, revertimos el script para que _borre_ los permisos que otorgamos individualmente al
comienzo, dejando solamente a los grupos con acceso a las carpetas.

[apps-script-error-log]: /assets/collections/posts/2022-08-28-ITBA_Drive_Migration-AppsScript_ErrorLog.png

[apps-script-error]: /assets/collections/posts/2022-08-28-ITBA_Drive_Migration-AppsScript_Error.png


[google-apps-script]: https://www.google.com/script/start/ "Google Apps Script homepage"

[apps-script-limitations]: https://developers.google.com/apps-script/guides/services/quotas#current_limitations "Quotas for Apps Script"

[google-groups]: https://groups.google.com/ "Google Groups homepage"

[google-workspace]: https://workspace.google.com/ "Google Workspace homepage"

# Pendientes

Si bien con el trabajo realizado hasta ahora podría parecer que está todo funcionando, todavía hay algunos temas por resolver:

- Algunas carpetas todavía tienen los permisos mezclados, muchas ocultas dentro de otras subcarpetas.
Es probablemente el pendiente más urgente a resolver.
- ¿Cómo nos aseguramos que el contenido nuevo que suban nuestros compañeros se organice donde corresponde?
- Google Drive considera la cuota de espacio del usuario que sube los archivos, incluso cuando lo
hace en una carpeta cuyo dueño es otro usuario. ¿Cómo evitamos lo primero y nos "adueñamos" del
contenido?

# Agradecimientos y colaboradores

Para finalizar, quiero dar las gracias a los creadores e impulsores de las carpetas originales de 
material y a todos los que lograron que la unificación sea posible:
- Nicolás Bustelo
- Martín Saad Heinen
- Abril Virili
- Angela Toci
- Benjamín Ricci
- Ezequiel Grinbaum
- Gabriela D'Aversa
- Gonzalo Díaz Excoffon
- Marcos Dedeu
- Martín Casá
- Máximo Navarrane
- Tiffany Leiva

Y a las organizaciones estudiantiles que representan algunos de los mencionados anteriormente, que
también aportaron recursos:
- CEITBA
- IEEE Student Chapter
- Computer Society
- AIChE

