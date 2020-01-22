FROM node:8.14.0-alpine

WORKDIR /opt/iotagent-sigfox

RUN apk add --no-cache git python make bash gcc g++ zeromq-dev musl-dev zlib-dev krb5-dev python-pip &&  pip install pyopenssl

COPY . .

RUN npm install && npm run-script build

RUN chmod +x entrypoint.sh

EXPOSE 80

ENTRYPOINT ["./entrypoint.sh"]


