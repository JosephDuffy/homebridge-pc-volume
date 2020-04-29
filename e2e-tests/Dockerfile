FROM node:12

RUN mkdir /app
WORKDIR /app

RUN npm install -g --unsafe-perm homebridge

COPY config.json /root/.homebridge/config.json
COPY package/ ./

RUN npm install --global $(pwd)

CMD [ "homebridge" ]
