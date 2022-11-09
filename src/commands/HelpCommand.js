/**
 * Copyright ©2022 Dana Basken
 */

const Command = require("./Command");

class HelpCommand extends Command {

  get help() {
    return {
      description: "Help",
      required: [],
      optional: [
        {arg: "<command>", description: "Get detailed help for <command>"},
      ]
    }
  }

  get command() { return "help"; }
  get aliases() { return ["?"]; }

  async execute(args) {
    if (args._.length > 0) {
      const commandInfo = this._ignis.commandManager.findCommandInfo(args._[0]);
      if (commandInfo) {
        console.log("");
        console.log(commandInfo.command.getExtendedHelpText());
        console.log("");
      } else {
        console.log(`Unknown command: "${args._[0]}"`);
      }
    } else {
      const lines = [];
      let maxUsageLength = Number.NEGATIVE_INFINITY;
      for (const command of this._ignis.commandManager.commands) {
        const helpInfo = command.getBasicHelpInfo();
        if (helpInfo.usage.length > maxUsageLength) { maxUsageLength = helpInfo.usage.length; }
        lines.push(helpInfo);
      }
      console.log("");
      for (const line of lines) {
        console.log(`  ${" ".repeat(maxUsageLength - line.usage.length)}${line.usage} - ${line.description}`);
      }
      console.log("");
      console.log(` You may get detailed help by specifying the command name to help: "help cat"`);
      console.log("");
    }
  }

}

module.exports = HelpCommand;
