/* jslint node: true */
"use strict";

import { Request, Response, NextFunction } from "express";

function b64decode(data: string): string {
  if (typeof Buffer.from === "function") {
    return Buffer.from(data, 'base64').toString();
  } else {
    return (new Buffer(data, 'base64')).toString();
  }
}

export interface AuthRequest extends Request {
  user: string;
  userid: string;
  service: string;
}

class UnauthorizedError {
  message: string;
  constructor() {
    this.message = "Authentication (JWT) required for API";
  }
}

class InvalidTokenError {
  message: string = "Invalid authentication token given";
  constructor() { }
}

export function authParse(req: AuthRequest, res: Response, next: NextFunction) {
  const rawToken = req.header('authorization');
  if (rawToken === undefined) {
    return next();
  }

  const token = rawToken!.split('.');
  if (token.length != 3) {
    console.error("got invalid request: token is malformed", rawToken);
    return res.status(401).send(new InvalidTokenError());
  }

  const tokenData = JSON.parse(b64decode(token[1]));

  req.user = tokenData.username;
  req.userid = tokenData.userid;
  req.service = tokenData.service;
  next();
}

export function authEnforce(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user === undefined || req.user!.trim() === "") {
    // valid token must be supplied
    console.error("got invalid request: user is not defined in token", req.header('authorization'));
    return res.status(401).send(new UnauthorizedError());
  }

  if (req.service === undefined || req.service!.trim() === "") {
    // valid token must be supplied
    return res.status(401).send(new UnauthorizedError());
  }

  next();
}
