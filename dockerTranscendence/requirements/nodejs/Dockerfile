# Bsse image
FROM ubuntu:22.04

# Installing dependencies
RUN apt-get update
RUN apt-get upgrade -y  
RUN apt-get install -y npm curl

# Install and configure NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN /bin/bash -c "source ~/.nvm/nvm.sh && nvm install node"

# Installing your app
RUN mkdir src
WORKDIR /src
COPY ./frontend/package*.json ./
RUN npm install
RUN npm install -g n
RUN n latest
COPY ./frontend/* ./

# Specify the command to run your application
CMD ["npm", "run", "dev"]
