source "https://rubygems.org"

# Local preview (Ruby 3.2+): the github-pages gem forces safe mode, so _plugins/ never runs.
# Use ./bin/jekyll instead of `bundle exec jekyll` so Liquid is patched before serve/build:
#   ./bin/jekyll serve
# Optional: brew install ruby@3.3 && export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!
# gem "jekyll", "~> 3.8.5"

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem "minima", "~> 2.0"

# If you want to use GitHub Pages, remove the "gem "jekyll"" above and
# uncomment the line below. To upgrade, run `bundle update github-pages`.
gem "github-pages", group: :jekyll_plugins

# Ruby 3.4+ moved some stdlib into gems; Jekyll 3.x / Liquid still expect these when running on Ruby 4.x locally.
gem "csv"
gem "bigdecimal"

gem "webrick", "~> 1.8"
