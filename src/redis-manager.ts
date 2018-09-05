/* jslint node: true */
"use strict";

import redis = require("redis");
import crypto = require("crypto");
import fs = require('fs');
import config = require('./config');


export class ClientWrapper {
  client: redis.RedisClient;

  constructor(client: redis.RedisClient) {
    this.client = client;
  }

  loadScript(path: string, cb: (err: any, data: any) => void): void {
    let script = fs.readFileSync(path, { 'encoding': 'utf-8' });
    let sha1 = crypto.createHash('sha1').update(script);

    console.log(script, sha1.digest('hex'));
    this.client.script('load', script, cb);
  }

  runScript(path: string, keys: string[], vals: string[], callback: (error: any, data: any) => void) {
    let script = fs.readFileSync(path, { 'encoding': 'utf-8' });
    let sha1 = crypto.createHash('sha1').update(script).digest('hex');

    if (vals && (vals.length > 0)) {
      this.client.evalsha(sha1, keys.length, keys[0], vals[0], (err: any, data: any) => {
        if (err) {
          // console.log('failed to evalsha', err)
          if (err.code == 'NOSCRIPT') {
            this.loadScript(path, (err: any, data: any) => {
              this.client.evalsha(sha1, keys.length, keys[0], vals[0], (err: any, data: any) => {
                if (err) {
                  callback(err, undefined);
                } else {
                  callback(undefined, data);
                }
              })
            })
          }
        } else {
          // console.log('evalsha results', data);
          callback(undefined, data);
        }
      });
    } else {
      this.client.evalsha(sha1, keys.length, keys[0], (err: any, data: any) => {
        if (err) {
          // console.log('failed to evalsha', err)
          if (err.code == 'NOSCRIPT') {
            this.loadScript(path, (err: any, data: any) => {
              this.client.evalsha(sha1, keys.length, keys[0], (err: any, data: any) => {
                if (err) {
                  callback(err, undefined);
                } else {
                  callback(undefined, data);
                }
              })
            })
          }
        } else {
          // console.log('evalsha results', data);
          callback(undefined, data);
        }
      });
    }
  }
}

class RedisManager {
  redis: redis.RedisClient

  constructor() {
    // TODO redis params should be configurable
    this.redis = redis.createClient({ 'host': config.cache.redis })
  }

  getClient(service: string): ClientWrapper {
    return new ClientWrapper(this.redis);
  }
}

var redisSingleton = new RedisManager();
export { redisSingleton as RedisManager };
