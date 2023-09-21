---
#
#   Copyright 2023 Martín E. Zahnd
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

# layout: post
layout: note

title: Download Maven dependency sources and Javadocs for IntelliJ Idea
author: Martín E. Zahnd

# Force custom Date (in UTC)
# Example: 2021-10-22 05:02:23 -0300
# date:
# If it was edited, put the date here
# edit:

# Space separated tags
tags: spring maven intellij

# Set to add KaTeX support in the html
equations: false

# Table Of Contents
toc: false
---

<!--more-->

After searching for a while, I found it:

Outright running:

~~~ bash
mvn dependency:sources
~~~

As suggested in many sites **did not work** for my project, but instead running it with a ~clean install~ appended did the trick:

~~~ bash
mvn clean install dependency:sources -Dmaven.test.skip=true
~~~

After that command, run the following for installing all javadocs:

~~~ bash
mvn dependency:resolve -Dclassifier=javadoc
~~~

Of course, both can be run at the same time:

~~~ bash
mvn clean install dependency:sources dependency:resolve -Dmaven.test.skip=true -Dclassifier=javadoc
~~~

Note that the above command should be run whenever the ~pom.xml~ changes, so it can download the new sources and Javadocs.

## Previous attempts

From the same StackOverflow question, adding the following to my ~~/.m2/settings.xml~ did not work, but it apparently does work for users of Eclipse.

~~~ xml
<settings>

   <!-- ... other settings here ... -->

    <profiles>
        <profile>
            <id>downloadSources</id>
            <properties>
                <downloadSources>true</downloadSources>
                <downloadJavadocs>true</downloadJavadocs>
            </properties>
        </profile>
    </profiles>

    <activeProfiles>
        <activeProfile>downloadSources</activeProfile>
    </activeProfiles>
</settings>
~~~

# Sources

[Maven: Always download sources and javadocs - StackOverflow][so-maven]

[so-maven]: https://stackoverflow.com/q/5780758 "Maven – Always download sources and javadocs"
