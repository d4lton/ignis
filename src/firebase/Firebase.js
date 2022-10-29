/**
 * Copyright ©2022 Dana Basken
 */

const admin = require("firebase-admin");

class Firebase {
  constructor(config) {
    this._config = config;
    this._app = admin.initializeApp({credential: admin.credential.cert(this._config.get("firebase_config"))});
  }

  get app() {
    return this._app;
  }

}

module.exports = Firebase;
