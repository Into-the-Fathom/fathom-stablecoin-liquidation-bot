#FROM node:16
FROM fathombot/shared-base:latest

# Create app directory
WORKDIR /usr/src/app/worker

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run rebuild
CMD [ "npm", "run", "start" ]