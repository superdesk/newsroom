# -*- mode: ruby -*-
# vi: set ft=ruby :

$bootstrap = <<SCRIPT
#!/usr/bin/env bash

# install build dependencies
apt-get update
apt-get install -y python3-venv python3-pip docker docker-compose

# create python venv
if ! [ -d /opt/venv ]; then
    python3 -m venv /opt/venv
fi

# install python dependencies
source /opt/venv/bin/activate
pip install -U pip wheel
pip install -U -r /vagrant/requirements.txt
pip install -U -r /vagrant/dev-requirements.txt
SCRIPT

$start = <<SCRIPT
#!/usr/bin/env bash

docker-compose -f /vagrant/docker-compose.yml up -d

cd /vagrant

export PYTHONUNBUFFERED=true

export WEBPACK_SERVER_URL='http://10.0.2.2:8080/'
export ASSETS_URL='http://localhost:8080/'

source /opt/venv/bin/activate
python manage.py create_user admin@localhost.com admin admin admin true

honcho start &
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5000, host: 5050
  config.vm.network "forwarded_port", guest: 5100, host: 5100

  config.vm.provision :shell, inline: $bootstrap
  config.vm.provision :shell, inline: $start, run: "always"
end
