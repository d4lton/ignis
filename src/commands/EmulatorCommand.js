/**
 * Copyright ©2023 Dana Basken
 */

const Command = require("./Command");

class EmulatorCommand extends Command {

  get help() {
    return {
      description: "Toggle current project's emulator mode",
      required: [],
      optional: []
    }
  }

  get command() { return "emulator"; }

  async execute(args) {
    const config = this._ignis.config.get(`firebase_config.${this._ignis.project}`);
    config.type = config.type === "service_account" ? "emulator" : "service_account";
    this._ignis.config.set(`firebase_config.${this._ignis.project}`, config);
  }

}

module.exports = EmulatorCommand;
