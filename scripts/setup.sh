#!/usr/bin/env bash

##########################################################
# Run this script from the root of the project directory #
##########################################################

handle_docker() {
  pgrep -f docker >/dev/null 2>&1
  if [ $? -eq 1 ]; then
    tput setaf 1;
    echo "Error: Docker is not running. Start or install Docker and continue."
    exit 1
  fi
}

build_deps() {
  brew_handler
  npm_handler
  # pip_handler
}

brew_handler() {
  brew --version > /dev/null 2>&1
  if [ ! $? -eq 0 ]; then
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
  packages=(python@3 terraform npm)

  handler_X "brew ls" "brew install" "brew"
}

npm_handler() {
  packages=(grunt-cli)

  handler_X "npm list --depth 1 --global" "npm install --global grunt" "npm"
}

pip_handler() {
  packages=(awscli-local)

  handler_X "pip list | grep -F" "pip install" "pip"
}

handler_X() {
  existence_cmd="$1"
  install_cmd="$2"
  if [ $0 -eq "-zsh" ]; then
    read_cmd="read -k"
  else
    read_cmd="read -p"
  fi

  for package in "${packages[@]}"
  do
    `(echo $existence_cmd)` "$package" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "$package already installed..."
    else

      `(echo $read_cmd)` "REPLY?Install $package with $3? (Y/n)" -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]
      then
        `(echo $install_cmd)` "$package" > /dev/null 2>&1
      fi
    fi
  done
}

build_npm() {
  npm i
}

handler() {
  handle_docker

  build_deps
  build_npm
}

handler
