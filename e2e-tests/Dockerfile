FROM node:14

RUN mkdir /app
WORKDIR /app

RUN apt-get update
RUN apt-get install jq -y
COPY package-lock.json ./
RUN npm install -g --unsafe-perm homebridge@$(jq ".dependencies | .homebridge | .version" --raw-output < package-lock.json)

COPY config.json /root/.homebridge/config.json
COPY package/ ./

RUN npm install --global $(pwd)

CMD [ "homebridge" ]
