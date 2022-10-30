/**
 * Copyright ©2022 Dana Basken
 */

const admin = require("firebase-admin");
const Firestore = require("./Firestore");

class Firebase {

  constructor(config, project) {
    this._config = config;
    this._project = project;
    const firebaseConfig = this._config.get("firebase_config");
    if (!firebaseConfig) { throw new Error("No Firebase configurations found."); }
    const projectConfig = firebaseConfig[project];
    if (!projectConfig) { throw new Error(`No Firebase configuration found for project "${this._project}"`); }
    this._app = admin.initializeApp({credential: admin.credential.cert(projectConfig)}, this._project);
    this._firestore = new Firestore(this);
  }

  get app() {
    return this._app;
  }

  get firestore() {
    return this._firestore;
  }

}

module.exports = Firebase;
