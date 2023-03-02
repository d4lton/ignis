/**
 * Copyright ©2023 Dana Basken
 */

const Command = require("./Command");

class RevokeCommand extends Command {

  get help() {
    return {
      description: "Revoke user refresh token",
      required: [
        {arg: "<id>", description: "ID of user (email or UID, default email)"},
      ],
      optional: [
        {arg: "<name> <value>", description: "Set claim value"},
        {arg: "--uid", description: "The ID is a UID"},
        {arg: "--pretty", description: "Make the JSON pretty"}
      ]
    }
  }

  get command() { return "revoke"; }

  async getUser(id, uid) {
    if (uid) {
      return this._ignis.firebase.app.auth().getUser(id);
    } else {
      return this._ignis.firebase.app.auth().getUserByEmail(id);
    }
  }

  async revokeRefreshTokens(user) {
    await this._ignis.firebase.app.auth().revokeRefreshTokens(user.uid);
    console.log(`refresh tokens for ${user.email} [${user.uid}] have been revoked.`);
  }

  async execute(args) {
    if (args._.length !== 1) { return this.renderHelp(); }
    await this.revokeRefreshTokens(await this.getUser(args._[0], args.uid));
  }

}

module.exports = RevokeCommand;
