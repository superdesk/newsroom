# -*- mode: ruby -*-
# vi: set ft=ruby :

$start = <<SCRIPT
#!/usr/bin/env bash

export LC_ALL=C
export PYTHONUNBUFFERED=true

# install build dependencies
apt-get update
apt-get install -yy --no-install-recommends \
  python3-dev python3-venv python3-pip python3-wheel \
  docker.io docker-compose git gcc \
  libxml2-dev libxslt-dev zlib1g-dev libjpeg-dev

docker-compose -f /vagrant/docker-compose.yml up -d
while ! curl -sfo /dev/null 'http://localhost:9200/'; do echo -n '.' && sleep .5; done

cd /vagrant

export WEBPACK_SERVER_URL='http://10.0.2.2:8080/'
export ASSETS_URL='http://localhost:8080/'
export SECRET_KEY='newsroom'

# use python venv
python3 -m venv /opt/venv
source /opt/venv/bin/activate

pip install -U pip wheel setuptools
pip install -Ur requirements.txt

python manage.py create_user admin@localhost.com admin admin admin true
python manage.py elastic_init

if [[ -d /vagrant/dump ]]; then
    echo 'installing demo data'
    apt-get install -yy --no-install-recommends mongo-tools
    mongorestore --gzip /vagrant/dump
    python manage.py index_from_mongo
fi

honcho start -p 5050 > /var/log/newsroom.log &
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/bionic64"

  config.vm.network "forwarded_port", guest: 5050, host: 5050
  config.vm.network "forwarded_port", guest: 5150, host: 5150

  config.vm.provision :shell, inline: $start, run: "always"

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
  end
end
