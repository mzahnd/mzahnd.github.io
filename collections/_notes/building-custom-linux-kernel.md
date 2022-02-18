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

title: Building the Linux Kernel
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
date: 2020-03-28 08:34 -0300
# If it was edited, put the date here
edit: 2021-11-05 15:34 -0300

# Space separated tags
tags: linux kernel rtl8723de module custom

# Set to add KaTeX support in the html
equations: true

# Table Of Contents
toc: true
---


This are my personal notes on building the Linux Kernel.

I have originally written this in February 2020 when, for the second time in my life, I tried to
build the mainline kernel from source and [include extra drivers](#adding-rtl8723de-source) that
were not originally built in (I am talking about the Realtek RTL8723DE driver).

I have also made use of some internet resources and the book *Linux Kernel in a Nutshell*, by
Greg Kroah-Hartman, which I read before starting this journey.
See the [Sources](#sources) section for more information and links.

<!--more-->

## Before starting

- Do not run any of the following commands as root, unless a `]#` is shown at the beggining of the
  command. This is not necessary and can cause unexpected problems. [^do-not-root]
- You'll need the following tools
    - Tools in `build-essential` (Debian based distributions) or `base-devel` (Arch based)
    - `wget` or `curl`
    - `ld` and `as`: Both come in the [GNU Binutils][gnu-binutils] collection of binary tools
    (In both Debian and Arch based distributions, the package is called `binutils`).

[^do-not-root]:
    [^lkn-book], "Preface", p. xii.

## Getting the sources

### Downloading the sources

Get the tarball from the [Linux Kernel Archives][linux-kernel-archives] as well as the pgp file
and download them inside a folder in the home directory.

For example, for the 5.5.6 version of the kernel, do

~~~ console
]$ mkdir ~/linuxkernel
]$ cd linuxkernel
]$ wget -v https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.5.6.tar.xz
]$ wget -v https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.5.6.tar.sign
~~~

### Check the sources signature

Now import the keys belonging to the main kernel developers with the following command:

~~~ console
]$ gpg2 --locate-keys [username]@kernel.org
~~~

For example,

~~~ console
]$ gpg2 --locate-keys torvalds@kernel.org gregkh@kernel.org
~~~

As the signed file is the `.tar`, and not the `.xz`, `unxz` the sources

~~~ console
]$ unxz linux-5.5.6.tar.xz
~~~

And verify the `.tar` against the signature

~~~ console
]$ gpg2 --verify linux-5.5.6.tar.sign
~~~

For more information read the [Signatures][lka-signatures] section in the Linux Kernel Archives
website.

### Extract the sources

Run

~~~ console
]$ tar -xvf linux-5.5.6.tar
]$ cd linux-5.5.6
]$ make mrproper # Clear configurations brought with the sources; this calls the clean target also
~~~

to untar the sources, enter the newly created directory and clean any posible configuration coming
inside the `.tar` file.

## Configuring the kernel

Copy the current kernel configurations (they are working, aren't they?) and then edit them using
the ncurses menu.

~~~ console
]$ zcat /proc/config.gz > .config
]$ make nconfig
~~~

### Finding a specific module [^find-specific-module]

[^find-specific-module]:
    [^lkn-book], Ch. 7, pp. 46-52.

In this example we're looking for the module of the ethernet controller (eno1 in this machine). 

~~~ console
]$ ls /sys/class/net
# Output:
#   eno1 lo wlo1
]$ basename `readlink /sys/class/net/eno1/device/driver/module`
# Output:
#   r8169
~~~

After running this two commands, the first one for knowing the controller's name (`eno1 lo wlo1` in
my case) and the second one for the module's name (`r8169`), we should check if there is a 
`_CONFIG\_*_` option already in the Makefile. For this we run

~~~ console
]$ find -type f -name Makefile | xargs grep r8169
# Output:
#   ./drivers/net/ethernet/realtek/Makefile:r8169-objs += r8169_main.o r8169_firmware.o
#   ./drivers/net/ethernet/realtek/Makefile:obj-$(CONFIG_R8169) += r8169.o
~~~

Fortunately, `CONFIG_R8169` was found, so we can look up for it in the kernel configuration and
enable it. 

### Creating a Boot Logo

- Get (or create) an image with an exact size of 80x80px 
- Install netpbm
 ~~~ console
 ]# pacman -S netpbm # Or apt install netpbm on Debian based
 ~~~
- Go to the path where the image is and run
 ~~~ console
 ]$ pngtopnm <path2img>.png | ppmquant -fs 223 | pnmtoplainpnm > logo_<name>_clut224.ppm #Let's suppose logo_arch_clut224.ppm for this example
 ~~~
- Copy the new image in ppm format into drivers/video/logo folder
  - Add the following code in `include/linux/linux_logo.h`
    ~~~ c
     extern const struct linux_logo logo_arch_clut224;
    ~~~
- Add the following code in `drivers/video/logo/Kconfig`
 ~~~ console
 config LOGO_ARCH_CLUT224
 	bool "Arch Linux 224-color logo"
 	depends on LOGO
 	default y
 ~~~
- Add the following code in `drivers/video/logo/logo.c`
 ~~~ c
  // Add inside condition "if (depth >= 8) {"
  #ifdef CONFIG_LOGO_ARCH_CLUT224
                /* Arch Linux Logo */
                logo = &logo_arch_clut224;
  #endif
 ~~~
- Add to the Makefile in `drivers/video/logo/Makefile`
 ~~~ Makefile
 obj-$(CONFIG_LOGO_ARCH_CLUT224)		+= logo_arch_clut224.o
 ~~~

### Debug options

Set the following options to enable some extra debugging of the new kernel (let's face it, **it is
going to fail** the first time).

~~~ plain
CONFIG_DEBUG_INFO
CONFIG_DEBUG_INFO_DWARF4
CONFIG_GDB_SCRIPTS
CONFIG_KGDB
CONFIG_KGDB_SERIAL_CONSOLE
BLK_DEV_INITRD
CONFIG_SERIAL_8250
CONFIG_SERIAL_8250_PNP
CONFIG_SERIAL_8250_CONSOLE
~~~

### Adding binary blobs in the kernel

Some Intel and AMDGPU binary blobs are distributed only in the linux-firmware [^bin-linux-firmware]
package as well as the Bluetooth drivers for the RTL8723DE, among another things.
In the following example, some AMDGPU binary blobs will be used to explain hoy to add this into the
kernel.

[^bin-linux-firmware]:
    Check the kernel's [git repository here][bin-linux-firmware-repo].


#### Cloning linux-firmware (optional)

Start by cloning the linux-firmware package

~~~ console
]$ git clone git://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git
~~~

It'll take a little bit of time to download as its size (as of February 2020) is around 300 MiB.

It's important to notice that I cloned it in the same folder where I previously downloaded the
kernel sources (`~/linuxkernel`), as this will be usefull in a few steps.

#### Locating the desired `.bin` files

How to determine exactly which `.bin` files are needed varies on every case. In the case of the
AMDGPU ones, I'm using the [Gentoo Wiki on the topic][gentoo-wiki-amdgpu] for guidance.

#### Including the firmware

Before beginning, make sure that you are building directly *into* the kernel the desired drivers.
In other words, that they **are not** build as modules, as they need to be loaded directly from the
filesystem.


- `CONFIG_FW_LOADER` has to be enabled in order to load the firmware.
> Located in:
>&nbsp;&nbsp;-> Device Drivers
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-> Generic Driver Options
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-> Firmware loader
- And `CONFIG_EXTRA_FIRMWARE` has to be properly configured by using a string with the path to
 all the desired binary files to load.
 For example
 ~~~
 radeon/hainan_ce.bin radeon/hainan_mc.bin radeon/hainan_me.bin radeon/hainan_pfp.bin radeon/hainan_rlc.bin radeon/hainan_smc.bin radeon/TAHITI_uvd.bin amdgpu/hainan_ce.bin amdgpu/hainan_mc.bin amdgpu/hainan_me.bin amdgpu/hainan_pfp.bin amdgpu/hainan_rlc.bin amdgpu/hainan_smc.bin rtl_bt/rtl8723d_config.bin  rtl_bt/rtl8723d_fw.bin rtlwifi/rtl8723defw.bin
 ~~~
Which I got by executing the following line in bash:
~~~ console
echo linux-firmware/{amdgpu/hainan_{ce,k_smc,mc,me,pfp,rlc,smc},radeon/{hainan_{ce,k_smc,mc,me,pfp,rlc,smc},TAHITI_uvd},i915/skl_dmc_ver1_27,rtl_bt/rtl8723d_{config,fw},rtlwifi/rtl8723defw}.bin
~~~
- Last but not least, `CONFIG_EXTRA_FIRMWARE_DIR` is the path where all those binary blobs are.
 That could either be
 ~~~
 /lib/firmware/
 ~~~
 or, most probably, the one where you cloned the `linux-firmware` files.

### Adding RTL8723DE source code into the kernel    {#adding-rtl8723de-source}

> When I originally wrote this notes, the Realtek RTL8723DE chip was not built into the kernel so
> I had to do it manually in order to connect to Wi-Fi networks.
> 
> As of [this commit][rtw88-8723de-kernel] (commited on May 2020) this is no longer necessary
> because the source code has been marked as *ready* and is now built in. Also, the `rtlwifi_new`
> repository doesn't exist anymore.
>
> Nonetheless, I decided to keep this section here as a remainder of "what to do" if I ever again
> need to build something external to the mainline kernel and because it represents the first time
> I took a look to someone elses "real world" C code in order to learn how things are actually
> done.


Clone the extended branch from [`rtlwifi_new` GitHub repository](lwfinger/rtlwifi_new) on the same
folder as the kernel, `~/linuxkernel/` in my case.

Then we need to copy the related files in between the kernel source code.
~~~ console
mkdir linux-5.5.6/drivers/net/wireless/realtek/rtlwifi/rtl8723de/
cp -vR rtlwifi_new/rtl8723de/ linux-5.5.6/drivers/net/wireless/realtek/rtlwifi/
~~~

And edit the following Makefiles, comparing both with the one in `rtlwifi_new/rtl8723de/` and in
`rtlwifi_new/` respectively:
~~~ plain
linux-5.5.6/drivers/net/wireless/realtek/rtlwifi/Makefile
linux-5.5.6/drivers/net/wireless/realtek/rtlwifi/rtl8723de/Makefile
~~~


## Compiling the Kernel

Before going on, don't forget to add something to the `EXTRAVERSION` parameter in the Makefile of
the kernel.

Now yes, finally, it is time!

Compile the kernel using the following command.

~~~ console
]$ make -j$(nproc)
~~~
- `-jX` Tells make to use X number of threads at the same time.
- `$(nproc)` runs `nproc`, which prints the number of processing units available. 
 (So, you can make no mistake when replacing the `X` after the `-j`).

## Installing the Kernel

> **NOTE:** The following commands need root access. Think twice before you
> actually do something!

### Previous steps

Let's make some backups (copies) of the critical files that'll be replaced.

- Make a copy of the initramfs file(s)
~~~ console
]# cp -v /boot/initramfs-linux.img /boot/initramfs-linux.img.bckp
]# cp -v /boot/initramfs-linux-fallback.img/boot/initramfs-linux-fallback.img.bckp
~~~
- Backup of the current GRUB
~~~ console
]# mkdir /boot/grub_bckp
]# cp -rv /boot/grub /boot/grub_bckp/
]# cp -v /boot/grub/grub.cfg /boot/grub/grub.cfg.bckp
~~~
- Backup the linux preset file
~~~ console
]# cp -v /etc/mkinitcpio.d/linux.preset /etc/mkinitcpio.d/linux.preset.bckp
~~~

### Kernel modules

Install the kernel modules
~~~ console
]# make modules_install
~~~

### Copying the image

Copy the bzImage file and rename it in the process
~~~ console
]# cp -v arch/x86_64/boot/bzImage /boot/vmlinuz-linux556
~~~
> **Note:** The new name **must** be prefixed with `vmlinuz-`. After the hyphen, whatever you type
> is a totally free choice.

### Creating the initial ramdisk

#### Manual method  {#initram-manual}

Came on, this one is funnier!

Generate the initramfs manually with
~~~ console
]# mkinitcpio -v -k /boot/<kernelimage> -g /boot/initramfs-<file name>.img
~~~

Where
- `-v` is for making the process verbose.
- `-k` (`--kernel`) Specifies the modules to use when generating the initramfs image.
 The `<kernelimage>` name will be the same as the name of the custom kernel source directory (and
 the modules directory for it, located in `/usr/lib/modules/`).
- `-g` (`--generate`) Specifies the name of the initramfs file to generate in the `/boot`
 directory. Using the name convention `linux<major revision><minor revision>` is recommended for
 keeping track of the different kernels.

> `mkinitcpio` only works on Arch Linux. In Debian based distribution the right tool is called
> `update-initramfs`.
>
> To mimic the previous command in Debian one should run
> ~~~ console
>  ]# update-initramfs -v -c -k /boot/<kernelimage>
> ~~~
>
> Where
> - `-v` is for making the process verbose.
> - `-c` creates a new initramfs. (There're also modes to update or remove existing initramfs.)
> - `-k` sets the specific kernel version for whom the initramfs will be generated.
>  The `<kernelimage>` name will be the same as the name of the custom kernel source directory (and
>  the modules directory for it, located in `/usr/lib/modules/`).

For this example,
~~~ console
]# mkinitcpio -v -k /boot/vmlinuz-linux556 -g /boot/initramfs-linux556.img 
~~~

> In debian based distributions,
> ~~~ console
>  ]# update-initramfs -v -c -k /boot/vmlinuz-linux556
> ~~~

#### Automated preset method

I'm not going to type it now. Enter the link and read it.

> Wow.
>
> I was (until now) the only one reading this notes, so this was directed to myself. I'm
> astonished. Such a *bad guy*! (...)

[This subsection of the ArchWiki][archwiki-kernel-trad-comp-auto] explains how to use an
existing preset file in order to automatically generate the initramfs.

It makes no real sense to copy and paste it, as I haven't tried it. The small period of my life I
kept building customized kernels I was using a bash script which ran the same command than I used
in the [manual method](#initram-manual).

### Copy System.map

Altough this file is not required for booting, it's a good idea to copy it as it works as a list of
functions in a particular build of a kernel.

~~~ console
]# cp -v System.map /boot/System.map
~~~

### Generate GRUB

~~~ console
]# grub-mkconfig -o /boot/grub/grub.cfg
~~~

> In Debian, the right command is `update-grub`
> ~~~ console
> ]# update-grub
> ~~~

## Speeding things up

Building a lot of modules is slow. Doing it many times the same day, it's even slower.

There're some little tricks to speed up the process a little bit without the need of a
supercomputer. The one I came across at the time is `ccache`.

### ccache

Add the following to the make statement when building the kernel:

~~~ console
CC="ccache gcc"
~~~

So it looks something like this:

~~~ console
make CC="ccache gcc" -j$(nproc)
~~~

## Maintaining the kernel up to date

### Applying patches
~~~ console
]$ patch -p1 < <dir_to_patch>
~~~

### Reverting patches

Let's suppose that we have a patch in a previous directory called `patch-5.5.6-7`, so we'll apply it like
~~~ console
]$ patch -p1 < .../patch-5.5.6-7
~~~

And revert it using `-R`
~~~ console
]$ patch -p1 -R .../patch-5.5.6-7
~~~

## Sources  {#sources}

[Include in-kernel firmware blobs in kernel binary][bin-blobs-in-kernel]

[Kernel/Traditional Compilation - ArchWiki][archwiki-kernel-trad-comp]

[GRUB: Configuration - ArchWiki][archwiki-grub-configuration]

[Find out which modules are associated with a usb device?][modules-associated-to-usb]

[Linux Kernel in a Nutshell][lkn] [^lkn-book]

[^lkn-book]:
    G. Kroah-Hartman, *Linux Kernel in a Nutshell*,
    1st. ed. Sebastopol, CA, USA: O’Reilly Media, Inc, 2007.


[gnu-binutils]: https://www.gnu.org/software/binutils/ "GNU Binutils"

[linux-kernel-archives]: https://www.kernel.org/ "The Linux Kernel Archives"
[lka-signatures]: https://www.kernel.org/signature.html "Linux kernel releases PGP signatures"

[bin-blobs-in-kernel]: https://unix.stackexchange.com/q/391273 "Include in-kernel firmware blobs in kernel binary"
[bin-linux-firmware-repo]: https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/ "Repository of firmware blobs for use with the Linux kernel"

[gentoo-wiki-amdgpu]: https://wiki.gentoo.org/wiki/AMDGPU "AMDGPU - Gentoo Wiki"
[gentoo-wiki-linux-firmware]: https://wiki.gentoo.org/wiki/Linux_firmware "Linux firmware - Gentoo Wiki"

[rtw88-8723de-kernel]: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/drivers/net/wireless/realtek/rtw88?id=f5df1a8b4376551f7fb2416135c58896b70a1467 "rtw88: 8723d: Add 8723DE to Kconfig and Makefile"


[archwiki-kernel-trad-comp-auto]: https://wiki.archlinux.org/title/Kernel/Traditional_compilation#Automated_preset_method "Automated preset method: Kernel/Traditional compilation - ArchWiki"

[lkn]: http://www.kroah.com/lkn/ "Linux Kernel in a Nutshell"
[archwiki-kernel-trad-comp]: https://wiki.archlinux.org/title/Kernel/Traditional_compilation "Kernel/Traditional compilation - ArchWiki"
[archwiki-grub-configuration]: https://wiki.archlinux.org/title/GRUB#Configuration "GRUB: Configuration - ArchWiki"
[modules-associated-to-usb]: https://unix.stackexchange.com/q/60078 "Find out which modules are associated with a usb device?"

