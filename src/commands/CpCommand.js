/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class CpCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Copy a document",
      required: [
        {arg: "<src-path>", description: "Source path"},
        {arg: "<dst-path>", description: "Destination path"}
      ],
      optional: []
    }
  }

  get command() { return "cp"; }

  async execute(args) {
    if (args._.length === 2) {
      const projectPathSourceInfo = this._ignis.getProjectPathInfo(args._[0]);
      const projectPathDestinationInfo = this._ignis.getProjectPathInfo(args._[1], projectPathSourceInfo);
      const data = await projectPathSourceInfo.firebase.firestore.get(projectPathSourceInfo.path);
      if (data) {
        await projectPathDestinationInfo.firebase.firestore.put(projectPathDestinationInfo.path, data, args.merge);
      }
    } else {
      this.renderHelp();
    }
  }

}

module.exports = CpCommand;
