/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class UseCommand extends Command {

  async completer(commandInfo) {
    const path = commandInfo.components.args._.pop();
    const prefix = [commandInfo.components.command, ...commandInfo.components.args._].join(" ");
    return this._ignis.projects.filter(project => project.startsWith(path)).map(it => `${prefix} ${it}`);
  }

  get help() {
    return {
      description: "Switch the current project",
      required: [{arg: "<project-id>", description: "The project ID to make default"}],
      optional: []
    }
  }

  get command() { return "use"; }

  async execute(args) {
    if (args._.length === 1) {
      this._ignis.project = args._[0]
    } else {
      this.renderHelp();
    }
  }

}

module.exports = UseCommand;
