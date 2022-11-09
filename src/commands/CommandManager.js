/**
 * Copyright ©2022 Dana Basken
 */

const minimist = require("minimist");
const LsCommand = require("./LsCommand");
const VersionCommand = require("./VersionCommand");
const UseCommand = require("./UseCommand");
const ProjectsCommand = require("./ProjectsCommand");
const HelpCommand = require("./HelpCommand");
const LoginCommand = require("./LoginCommand");
const QuitCommand = require("./QuitCommand");
const CpCommand = require("./CpCommand");
const CatCommand = require("./CatCommand");

class CommandManager {

  COMMANDS = [
    UseCommand,
    ProjectsCommand,
    LoginCommand,
    LsCommand,
    CatCommand,
    CpCommand,
    VersionCommand,
    HelpCommand,
    QuitCommand
  ];

  constructor(ignis) {
    this._ignis = ignis;
    this._commands = this.COMMANDS.map(it => new it(this._ignis));
    this._commandNames = this.commands.map(it => it.command);
  }

  async execute(line) {
    line = line.trim();
    const commandInfo = this.findCommandInfo(line);
    if (commandInfo) {
      await commandInfo.command.execute(commandInfo.components.args);
    } else {
      if (line) {
        console.log(`unknown command: "${line}" (try help)`);
      }
    }
  }

  findCommandInfo(line) {
    const components = this.parseLine(line);
    if (!components) { return; }
    const command = this.commands.find(it => it.command === components.command || it.aliases.includes(components.command));
    if (!command) { return; }
    return {
      command: command,
      components: components,
    }
  }

  parseLine(line) {
    line = line || "";
    const match = line.match(/^(.+?)\s+(.+)|(.+?)\s*$/);
    if (!match) { return; }
    const arg = match[2] || "";
    const args = minimist(arg.split(" "), {boolean: true})
    args._ = args._.filter(it => it);
    return {
      command: match[1] || match[3],
      args: args
    }
  }

  get commands() {
    return this._commands;
  }

  get commandNames() {
    return this._commandNames;
  }

}

module.exports = CommandManager;
