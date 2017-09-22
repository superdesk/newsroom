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
apt-get install -y python3-venv python3-pip yarn npm

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
yarn install --no-bin-links
SCRIPT

$start = <<SCRIPT
#!/usr/bin/env bash

cd /vagrant
source /opt/venv/bin/activate

if [ -f /tmp/server.pid ]; then
    kill `cat /tmp/server.pid`
    rm /tmp/server.pid
fi

if [ -f /tmp/client.pid ]; then
    kill `cat /tmp/client.pid`
    rm /tmp/client.pid
fi

python app.py &
echo $! >> /tmp/server.pid

/vagrant/node_modules/webpack-dev-server/bin/webpack-dev-server.js --content-base dist --host 0.0.0.0
#echo $! >> /tmp/client.pid

echo "done"
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5050, host: 5050
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provision :shell, inline: $bootstrap
  config.vm.provision :shell, inline: $start, run: "always"
end
