/**
 * Copyright ©2022 Dana Basken
 */

const admin = require("firebase-admin");
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
      optional: [
        {arg: "--recursive", description: "Copy the document and all sub-collections"}
      ]
    }
  }

  get command() { return "cp"; }

  async execute(args) {
    if (args._.length === 2) {
      const sourceInfo = this._ignis.getProjectPathInfo(args._[0]);
      const destinationInfo = this._ignis.getProjectPathInfo(args._[1], sourceInfo);
      let sourceRef;
      let destinationRef;
      if (sourceInfo.isCollection) {
        sourceRef = sourceInfo.firebase.app.firestore().collection(sourceInfo.path);
        destinationRef = destinationInfo.firebase.app.firestore().collection(destinationInfo.path);
      } else {
        sourceRef = sourceInfo.firebase.app.firestore().doc(sourceInfo.path);
        destinationRef = destinationInfo.firebase.app.firestore().doc(destinationInfo.path);
      }
      await this._copy(sourceRef, destinationRef, !!args.recursive);
    } else {
      this.renderHelp();
    }
  }

  async _copy(source, destination, recursive = false) {
    if (source instanceof admin.firestore.CollectionReference) {
      if (recursive) {
        const snapshot = await source.get();
        for (const documentSnapshot of snapshot.docs) {
          const child = await destination.firestore.doc(documentSnapshot.ref.path).get();
          await this._copy(documentSnapshot.ref, child.ref, recursive);
        }
      }
    } else if (source instanceof admin.firestore.DocumentReference) {
      console.log(`COPY ${source.path}...`);
      const snapshot = await source.get();
      const data = await snapshot.data();
      await destination.set(data, {merge: false});
      if (recursive) {
        const children = await source.listCollections();
        for (const child of children) {
          await this._copy(child, destination, recursive);
        }
      }
    } else {
      console.log("source is unknown", source);
    }
  }

}

module.exports = CpCommand;
