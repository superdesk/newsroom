# -*- mode: ruby -*-
# vi: set ft=ruby :

$bootstrap = <<SCRIPT
#!/usr/bin/env bash

# add yarn repo
if ! [ -d /etc/apt/sources.list.d/yarn.list ]; then
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
fi

if ! [ -d /etc/apt/sources.list.d/mongodb.list ]; then
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | tee /etc/apt/sources.list.d/mongodb.list
fi

if ! [ -d /tmp/elasticsearch-1.7.6.deb ]; then
    cd /tmp
    wget -q https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.6.deb
    dpkg -i /tmp/elasticsearch-1.7.6.deb
fi

# install build dependencies
apt-get update
apt-get install -y python3-venv python3-pip yarn npm mongodb-org-server

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

cd /vagrant

systemctl start mongod

if [ -f /tmp/server.pid ]; then
    kill `cat /tmp/server.pid`
    rm /tmp/server.pid
fi

if [ -f /tmp/client.pid ]; then
    kill `cat /tmp/client.pid`
    rm /tmp/client.pid
fi

export NODE_PATH=/opt/node_modules
export NODE_MODULES=/opt/node_modules
/opt/node_modules/webpack-dev-server/bin/webpack-dev-server.js \
    --quiet \
    --host 0.0.0.0 \
    --port 8080 \
    --public localhost:8080 \
    --watch-poll 1000 &

echo $! >> /tmp/client.pid

echo 'webpack: building..'
# wait for initial webpack build
while ! curl -sfo /dev/null 'http://localhost:8080/manifest.json'; do echo -n '.' && sleep .5; done
echo 'done.'

# start server
source /opt/venv/bin/activate
python manage.py create_user admin@localhost.com admin admin admin true
python app.py &
echo $! >> /tmp/server.pid
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5050, host: 5050
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provision :shell, inline: $bootstrap
  config.vm.provision :shell, inline: $start, run: "always"
end
