/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class HelpCommand extends Command {

  get help() {
    return {
      description: "Help",
      required: [],
      optional: []
    }
  }

  get command() { return "help"; }
  get aliases() { return ["?"]; }

  async execute(args) {
    for (const command of this._ignis.commandManager.commands) {
      console.log("");
      console.log(command.renderHelp());
    }
    console.log("");
  }

}

module.exports = HelpCommand;
