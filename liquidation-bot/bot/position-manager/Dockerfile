#FROM node:16
FROM shared-base:latest

# Create app directory
WORKDIR /usr/src/app/position-manager

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# ADD ../shared ./

# WORKDIR /usr/src/app/shared

# RUN npm install

# WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run rebuild
CMD [ "npm", "run", "start" ]