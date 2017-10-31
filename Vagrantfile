# -*- mode: ruby -*-
# vi: set ft=ruby :

$bootstrap = <<SCRIPT
#!/usr/bin/env bash

# add yarn repo
if ! [ -d /etc/apt/sources.list.d/yarn.list ]; then
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
fi

# install build dependencies
apt-get update
apt-get install -y python3-venv python3-pip yarn npm docker docker-compose

# use node lts
npm install -g n
n lts

# create python venv
if ! [ -d /opt/venv ]; then
    python3 -m venv /opt/venv
fi

# install python dependencies
source /opt/venv/bin/activate
pip install -U pip wheel
pip install -U -r /vagrant/requirements.txt
pip install -U -r /vagrant/dev-requirements.txt

cd /vagrant

# install javascript dependencies
yarn install --no-bin-links --modules-folder /opt/node_modules
SCRIPT

$start = <<SCRIPT
#!/usr/bin/env bash

docker-compose -f /vagrant/docker-compose.yml up -d

cd /vagrant

export NODE_PATH=/opt/node_modules
export NODE_MODULES=/opt/node_modules
export PYTHONUNBUFFERED=true

source /opt/venv/bin/activate
python manage.py create_user admin@localhost.com admin admin admin true

honcho start -f vagrant/Procfile
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5000, host: 5050
  config.vm.network "forwarded_port", guest: 5100, host: 5100
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provision :shell, inline: $bootstrap
  config.vm.provision :shell, inline: $start, run: "always"
end
