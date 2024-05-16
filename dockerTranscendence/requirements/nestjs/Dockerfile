#Base image
FROM node

# Installing your app
WORKDIR /src
COPY ./backend/src/package*.json ./
RUN npm install
COPY ./backend ./

# Specify the command to run your application
CMD ["npm", "start", "run", "dev"]