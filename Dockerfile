# Base image with both NodeJS and Python
# https://github.com/nikolaik/docker-python-nodejs
FROM nikolaik/python-nodejs:latest

# FROM r-base

# Python modules for use by Lambda functions
RUN pip3 install numpy scipy

# Haskell runtime
# RUN curl https://get-ghcup.haskell.org -sSf | sh

# Setup the Lambda Server application (NodeJs)
WORKDIR /app

COPY package.json /app
COPY . /app

RUN npm i
CMD npm run serve

EXPOSE 4000