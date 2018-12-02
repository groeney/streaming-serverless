#!/usr/bin/env bash

##########################################################
# Run this script from the root of the project directory #
##########################################################

handle_docker() {
  pgrep -f docker >/dev/null 2>&1
  if [ $? -eq 1 ]; then
    tput setaf 1;
    echo "Error: Docker is not running, start or install Docker and continue." 
    exit 1
  fi
}

handle_grunt() {
  npm list --depth 1 --global grunt-cli > /dev/null 2>&1

  if [ $? -eq 1 ]; then
    tput setaf 1;
    echo "Grunt not installed globally! Install with -g manually if desired to run via CLI without NPX!"
    tput sgr0;
  fi
}

build_deps() {
  handler_brew
  handler_pip
}

handler_brew() {
  packages=(python@2 terraform)

  for package in "${packages[@]}"
  do
    brew ls $package >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "$package already installed"
    else
      brew install $package
    fi
  done
}

handler_pip() {
  packages=(localstack awscli-local)

  for package in "${packages[@]}"
  do
    pip list | grep -F $package >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "PIP Package $package"
    else
      pip install $package >/dev/null 2>&1
    fi
  done
}

source_nvm() {
  local NVM_LOCATION=false

  brew ls nvm >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    NVM_LOCATION=$(brew --prefix nvm)
  elif [ -n $NVM_DIR ]; then
    NVM_LOCATION=$NVM_DIR
  else
    handler_nvm
  fi

  . $NVM_LOCATION/nvm.sh
}

build_nvm() {
  nvm install
  nvm use
}

build_npm() {
  npm i
}

handler_nvm() {
  echo "Installing NVM"
  brew install nvm
}

handler() {
  handle_docker
  handle_grunt

  build_deps
  source_nvm
  build_nvm
  build_npm
}

handler
