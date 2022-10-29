/**
 * Copyright ©2022 Dana Basken
 */

const admin = require("firebase-admin");

class Firebase {

  constructor(config, project) {
    this._config = config;
    this._project = project;
    const firebaseConfig = this._config.get("firebase_config");
    if (!firebaseConfig) { throw new Error("No Firebase configurations found."); }
    const projectConfig = firebaseConfig[project];
    if (!projectConfig) { throw new Error(`No Firebase configuration found for project "${this._project}"`); }
    this._app = admin.initializeApp({credential: admin.credential.cert(projectConfig)}, this._project);
  }

  get app() {
    return this._app;
  }

}

module.exports = Firebase;
