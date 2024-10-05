/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const Command = require("./Command");

class CatCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Dump the contents of a path",
      required: [
        {arg: "<path>", description: "Path"},
      ],
      optional: [
        {arg: "--pretty", description: "Make the JSON pretty"},
        {arg: "--output=<file-path>", description: "Output the JSON to a file"}
      ]
    }
  }

  get command() { return "cat"; }

  async execute(args) {
    if (args._.length === 1) {
      const projectPathInfo = this._ignis.getProjectPathInfo(args._[0]);
      let data = await projectPathInfo.firebase.firestore.get(projectPathInfo.path);
      data = args.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      if (args.output) {
        fs.writeFileSync(args.output, data);
      } else {
        console.log(data);
      }
    } else {
      this.renderHelp();
    }
  }

}

module.exports = CatCommand;
