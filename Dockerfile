FROM node:18-bullseye

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .

RUN npm install

RUN npm run build

WORKDIR /usr/src/app/examples/hello-world-web

RUN npm install
RUN npm run build


EXPOSE 3000
CMD [ "npm", "start" ]
