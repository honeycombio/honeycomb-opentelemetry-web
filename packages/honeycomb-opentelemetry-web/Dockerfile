FROM node:24-bookworm

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

WORKDIR /usr/src/app/examples/hello-world-web

RUN npm install
RUN npm run build


EXPOSE 3000
CMD [ "npm", "start" ]
