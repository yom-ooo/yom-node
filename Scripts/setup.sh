#!/bin/bash

# .............................
# Install required packages
#..............................
sudo apt update -y
sudo apt upgrade -y
sudo apt install x11-xserver-utils -y
sudo apt install awscli -y
sudo apt install dpkg-dev -y
sudo apt install net-tools -y
sudo apt install npm -y
sudo apt install jq -y
sudo apt install xorg-dev -y
sudo apt install unzip gcc make linux-headers-$(uname -r) -y
sudo apt install -y mesa-utils

# .............................
# Install Docker
#..............................
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce

# .............................
# Install Node.js
#..............................
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# .............................
# Install NVIDIA Drivers (sigServer Only)
#..............................
#At this point you probably need to SSH into the VM and run sudo aws configure
sudo aws s3 cp --recursive s3://ec2-linux-nvidia-drivers/latest/ .
sudo chmod +x NVIDIA-Linux-x86_64*.run
sudo /bin/sh ./NVIDIA-Linux-x86_64*.run
nvidia-smi -q | head
sudo systemctl set-default graphical.target
sudo init 3
sudo init 5
sudo nvidia-xconfig --preserve-busid --enable-all-gpus
sudo DISPLAY=:0 XAUTHORITY=$(ps aux | grep "X.*\-auth" | grep -v grep \
| sed -n 's/.*-auth \([^ ]\+\).*/\1/p') glxinfo | grep -i "opengl.*version"

# Ensure you remove all existing ssh keys before creating the ami otherwise SSH will fail
sudo rm -f /etc/ssh/ssh_host*
sudo rm -f /home/ubuntu/.ssh/authorized_keys

# .............................
# Install Node.js dependencies
#..............................
npm install