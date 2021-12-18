FROM node:12-alpine

#Create app directory
WORKDIR /usr/src/app

#Bundle app source
COPY . .

# Install app dependencies
RUN npm install

#Install pm2 for node 
RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "app.js"]