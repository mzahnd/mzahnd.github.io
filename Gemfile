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


# frozen_string_literal: true

source "https://rubygems.org"

git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }


gem "jekyll"    # GH Pages
# gem "github-pages", "~> 223", group: :jekyll_plugins # GH Pages

gem "kramdown"
# gem "kramdown-syntax-coderay", "~> 1.0"
gem "http_parser.rb", ">= 0.6.1"
gem "ffi", "~> 1.15"
gem "rouge"
gem "webrick", "~> 1.7"


# Plugins
group :jekyll_plugins do
 
  # KaTeX equations
  gem 'jekyll-katex'
  
  # Table of Contents
  # https://github.com/toshimaru/jekyll-toc
  gem 'jekyll-toc'

  # Cool block quotes 
  # https://github.com/lazee/premonition
  gem "premonition", "4.0.1"
  
  # Adds loading="lazy" to images and iframe
  # https://github.com/gildesmarais/jekyll-loading-lazy
  gem 'jekyll-loading-lazy'
  
  # Sitemap for browsers
  gem 'jekyll-sitemap'

  # SEO
  gem 'jekyll-seo-tag'
end
