/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const Command = require("./Command");

class LsCommand extends Command {

  async completer(commandInfo) {
    return this.pathCompleter(commandInfo);
  }

  get help() {
    return {
      description: "Listing documents or collections",
      required: [],
      optional: [
        {arg: "<path>", description: "The path to list the documents or collections of"},
        {arg: "--out=<filename>", description: "Redirect the output to a file"}
      ]
    }
  }

  get command() { return "ls"; }

  async execute(args) {
    if (args._.length < 2) {
      const projectPathInfo = this._ignis.getProjectPathInfo(args._[0]);
      const data = await projectPathInfo.firebase.firestore.list(projectPathInfo.path);
      if (!data?.length) {
        console.log("Nothing found.");
        return;
      }
      if (args.out) { // TODO: use > like in cat
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        for (const path of data) {
          console.log(path);
        }
      }
    } else {
      this.renderHelp();
    }
  }

}

module.exports = LsCommand;
