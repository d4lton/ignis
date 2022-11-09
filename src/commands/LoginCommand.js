/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const Command = require("./Command");

class LoginCommand extends Command {

  get help() {
    return {
      description: "Set the login credentials for the current project",
      required: [{arg: "<filename>", description: "The JSON file containing the Firebase credentials"}],
      optional: []
    }
  }

  get command() { return "login"; }

  async execute(args) {
    if (args._.length === 1) {
      const file = args._[0];
      if (fs.existsSync(file)) {
        const json = JSON.parse(fs.readFileSync(file).toString());
        this._ignis.config.set(`firebase_config.${this._ignis.project}`, json);
        this._ignis.login(this._ignis.project);
      } else {
        console.log(`Could not find file "${file}"`);
      }
    } else {
      this.renderHelp();
    }
  }

}

module.exports = LoginCommand;
