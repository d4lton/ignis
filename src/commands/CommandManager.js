/**
 * Copyright ©2022 Dana Basken
 */

const minimist = require("minimist");
const CatCommand = require("./CatCommand");
const ClaimsCommand = require("./ClaimsCommand");
const CpCommand = require("./CpCommand");
const EditCommand = require("./EditCommand");
const EditorCommand = require("./EditorCommand");
const EmulatorCommand = require("./EmulatorCommand");
const FindCommand = require("./FindCommand");
const HelpCommand = require("./HelpCommand");
const LinkCommand = require("./LinkCommand");
const LoginCommand = require("./LoginCommand");
const LsCommand = require("./LsCommand");
const ProjectsCommand = require("./ProjectsCommand");
const QuitCommand = require("./QuitCommand");
const RevokeCommand = require("./RevokeCommand");
const RmCommand = require("./RmCommand");
const UseCommand = require("./UseCommand");
const VersionCommand = require("./VersionCommand");

class CommandManager {

  COMMANDS = [
    CatCommand,
    ClaimsCommand,
    CpCommand,
    EditCommand,
    EditorCommand,
    EmulatorCommand,
    // FindCommand,
    HelpCommand,
    // LinkCommand,
    LoginCommand,
    LsCommand,
    ProjectsCommand,
    QuitCommand,
    RevokeCommand,
    RmCommand,
    UseCommand,
    VersionCommand
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
    const match = line.match(/^(\w+)\s*(.*)$/);
    if (!match) { return; }
    const arg = match[2] || "";
    const parts = (arg.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [])
      .map(part => part.match(/^"(.+?)"$/)?.[1] ?? part);
    const args = minimist(parts, {boolean: true});
    args._ = args._.filter(it => it);
    return {
      command: match[1],
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
