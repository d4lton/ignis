/**
 * Copyright ©2022 Dana Basken
 */

const chalk = require("chalk");

class Command {

  constructor(ignis) {
    this._ignis = ignis;
  }

  get help() {
    return {
      description: "TODO",
      required: [],
      optional: []
    }
  }

  get command() { return ""; }
  get aliases() { return []; }

  async completer(commandInfo) {
    return [];
  }

  async pathCompleter(commandInfo) {
    const path = commandInfo.components.args._.pop();
    const prefix = [commandInfo.components.command, ...commandInfo.components.args._].join(" ");
    const projectPathInfo = this._ignis.getProjectPathInfo(path);
    const listPath = projectPathInfo.components.path !== "." ? projectPathInfo.components.path : "";
    const data = await projectPathInfo.firebase.firestore.list(listPath);
    return data
      .filter(path => path.startsWith(projectPathInfo.path))
      .map(it => `${prefix} ${projectPathInfo.projectSpecified ? `${projectPathInfo.project}:` : ""}${it}`);
  }

  getBasicHelpInfo() {
    return {
      usage: this._getUsageText(),
      description: this.help.description
    }
  }

  _getUsageText() {
    const usage = [];
    usage.push(this.command);
    if (this.help.required?.length) {
      for (const required of this.help.required) {
        usage.push(required.arg);
      }
    }
    if (this.help.optional?.length) {
      for (const optional of this.help.optional) {
        usage.push(`[${optional.arg}]`);
      }
    }
    return usage.join(" ");
  }

  getExtendedHelpText() {
    const lines = [];
    lines.push(`${this.help.description}:`);
    const args = [];
    let maxArgLength = Number.NEGATIVE_INFINITY;
    if (this.help.required?.length) {
      for (const required of this.help.required) {
        args.push(required);
        if (required.arg.length > maxArgLength) { maxArgLength = required.arg.length; }
      }
    }
    if (this.help.optional?.length) {
      for (const optional of this.help.optional) {
        args.push(optional);
        if (optional.arg.length > maxArgLength) { maxArgLength = optional.arg.length; }
      }
    }
    lines.push("");
    lines.push(`  > ${this._getUsageText()}`);
    if (args.length) {
      lines.push("");
      for (const arg of args) {
        const spaces = maxArgLength - arg.arg.length;
        lines.push(`    ${" ".repeat(spaces)}${arg.arg} - ${chalk.dim(arg.description)}`);
      }
    }
    if (this.help.notes) {
      lines.push("");
      lines.push("NOTES:");
      lines.push("");
      for (const note of this.help.notes) {
        lines.push(`  - ${note}`);
      }
    }
    return lines.join("\n");
  }

  renderHelp() {
    console.log("");
    console.log(this._getUsageText());
    console.log("");
  }

}

module.exports = Command;
