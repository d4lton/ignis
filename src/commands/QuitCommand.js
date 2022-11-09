/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class QuitCommand extends Command {

  get help() {
    return {
      description: "Quit",
      required: [],
      optional: []
    }
  }

  get command() { return "quit"; }
  get aliases() { return ["exit"]; }

  async execute(args) {
    process.exit(0);
  }

}

module.exports = QuitCommand;
