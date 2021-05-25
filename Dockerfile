FROM node:15-alpine3.13

# iproute2 includes the ss cli
RUN apk update && apk add iproute2

WORKDIR /opt/sidecar-monitor
COPY package.json .
COPY src .

RUN npm install

CMD [ "node", "main.js" ]