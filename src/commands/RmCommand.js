/**
 * Copyright ©2023 Dana Basken
 */

const fs = require("node:fs");
const Command = require("./Command");

class RmCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Remove document",
      required: [],
      optional: [
        {arg: "<path>", description: "The path to of the document to remove"}
      ]
    }
  }

  get command() { return "rm"; }

  async execute(args) {
    if (args._.length === 1) {
      const projectPathInfo = this._ignis.getProjectPathInfo(args._[0]);
      projectPathInfo.firebase.firestore.delete(projectPathInfo.path);
    } else {
      this.renderHelp();
    }
  }

}

module.exports = RmCommand;
