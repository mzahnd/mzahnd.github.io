# Martín's blog

This is my personal blog and represents the first steps in my personal journey 
for learning web developement.


# Building
This site uses some Sass at-rules like `@use` that are not supported by
[jekyll-sass-converter](https://github.com/jekyll/jekyll-sass-converter), which
uses [sassc](https://rubygems.org/gems/sassc).
There is also [sass-embedded](https://rubygems.org/gems/sass-embedded), but it 
is not yet stable and I was not able to make it work with my files.


To solve this, I have written a minimal build file in `build-server/build.sh`
which runs build commands for Sass and Jekyll.

Under the same folder, `run_server.sh` runs a minimalistic server in your
machine Python's `http.server`. This is very usefull to see the website before
publishing it.


## License

Unless properly noticed, images, source code, blog entries, and everything else
in this repository has been drawn and or written by myself and is published
under the *Apache License 2.0*.

> Copyright 2022 Martín E. Zahnd
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
>     https://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.

See the [LICENSE](LICENSE) file for more information.
