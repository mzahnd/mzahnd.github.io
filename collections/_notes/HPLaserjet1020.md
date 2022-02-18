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

title: Installing an HP LaserJet 1020 in Arch Linux
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
date: 2021-03-20 16:42 -0300
# If it was edited, put the date here
edit: 2021-11-05 12:30 -0300

# Space separated tags
tags: hp laserjet 1020 printer linux

# Set to add KaTeX support in the html
equations: false

# Table Of Contents
toc: true
---


This notes summarize what needs to be done to properly configure and install an HP LaserJet 1020 in
Arch Linux using the propietary plugin. 

<!--more-->

## Open Source alternative plugin

There's an open source version called `foo2zjs` which doesn't seem to  work very well (yet) with
this particular  printer and, among other things, the last time I tried, it had to be reinstalled
and reconfigured every time the device was powered off and on again.

Check the [official website](https://foo2zjs.linkevich.net/) and the 
[AUR package](https://aur.archlinux.org/packages/foo2zjs-nightly/) if you are interested.

## Dependencies

~~~ console
]# pacman -S mlocate cups cups-pdf pyqt5 sane
]# systemctl enable org.cups.cupsd.service
]# systemctl start org.cups.cupsd.service
]$ yay -S python-pyqt4 hplip-plugin
]# sudo updatedb # Update mlocate db.
~~~

Even if you have already installed CUPS, restart the service to make sure that **it is** running.

~~~ console
]# systemctl restart org.cups.cupsd.service
~~~

## Fixing missing .so files [^cannot-locate-missing-so]

[^cannot-locate-missing-so]:
    If you can not locate the missing files, try running the steps to download and install the hp
    plugin first.

Run hp-setup and log its stderr to a file. Be aware that after choosing the printer, the "missing
pluggin" o any other screen might not be seen when doing this.

~~~ console
]$ hp-setup -g &> ~/hp-setup.log
]$ cat ~/hp-setup.log
~~~

When openning the file, you'll se something like:

~~~ plain
hp-setup[19265]: debug: Either /usr/lib/i386-linux-gnu/sane/libsane-hp2000S1.so file is not present or symbolic link is missing
~~~

You have to locate where is the .so file

~~~ console
]$ locate libsane-hp2000S1
~~~

And create a link to it (if you're having trouble creating the link, make sure that the destination
folder exists with `mkdir -p /usr/lib/i386-linux-gnu/sane/`, for example).

~~~ console
]# ln -s /usr/lib/sane/libsane-hp2000S1.so /usr/lib/i386-linux-gnu/sane/libsane-hp2000S1.so
~~~

After having done this with all the files and getting no more errors when opening hp-setup,
continue to the next step.

## Downloading hp-plugin

Apparently, the MIT server has some trouble retrieving the key, so we will change the line 45 on
`/usr/share/hplip/base/validation.py` from `pgp.mit.edu` to `keyserver.ubuntu.com`.

After that, run the plugin utility, download it and install it.

~~~ console
]$ hp-plugin -i
~~~

## Checking that there are no missing dependencies.

Run

~~~ console
]$ hp-doctor
~~~
And read its output to verify if any dependency marked as _REQUIRED_ is missed. If so, install it.

## Final step

Run

~~~ console
]$ hp-setup
~~~

:)

## Sources 

[HPLIP 3.19.1 - hp-plugin won't install/update - unable to receive keys](https://bugs.launchpad.net/hplip/+bug/1818629)

[No PPD found for model deskjet_4620 using new/old algorithm](https://bugs.launchpad.net/hplip/+bug/1084062)
