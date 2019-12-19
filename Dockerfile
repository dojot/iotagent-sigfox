FROM node:8.14.0-alpine as basis

WORKDIR /opt/iotagent-sigfox

RUN apk add git python make bash gcc g++ zeromq-dev musl-dev zlib-dev krb5-dev --no-cache
RUN mkdir -p ./src/lua

COPY package.json .

COPY ./src/lua ./src/lua
RUN npm install
COPY . .
RUN npm run-script build
RUN chmod +x entrypoint.sh


FROM node:8.14.0-alpine
COPY --from=basis /opt/iotagent-sigfox /opt/iotagent-sigfox
WORKDIR /opt/iotagent-sigfox
EXPOSE 80
ENTRYPOINT ["./entrypoint.sh"]
