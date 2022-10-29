/**
 * Copyright ©2022 Dana Basken
 */

const fs = require("node:fs");
const readline = require("node:readline");
const minimist = require("minimist");
const UserConfig = require("./UserConfig");
const Firebase = require("./firebase/Firebase");
const Firestore = require("./firebase/Firestore");

class Ignis {

  config = new UserConfig("com.basken.ignis");

  constructor(argv) {
    this._argv = argv;
  }

  async start() {
    const input = readline.createInterface({input: process.stdin, output: process.stdout});

    const firebaseConfig = this.config.get("firebase_config");
    if (!firebaseConfig) {
      console.log("Could not determine Firebase configuration, please set with the 'login' command.");
    } else {
      this._firebase = new Firebase(this.config);
      this._firestore = new Firestore(this._firebase);
    }

    input.prompt();
    input.on("line", async (line) => {
      const args = minimist(line.split(" "));
      try {
        if (args._.length > 0) {
          switch (args._[0]) {
            case "login":
              await this.handleLoginCommand(args);
              break;
            case "cat":
              await this.handleCatCommand(args);
              break;
            case "cp":
              await this.handleCpCommand(args);
              break;
            case "ls":
              await this.handleLsCommand(args);
              break;
            case "help":
              await this.handleHelpCommand(args);
              break;
            default:
              console.log(`unknown command: ${args._[0]}`);
              await this.handleHelpCommand(args);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
      input.prompt();
    });

  }

  async handleHelpCommand(args) {
    console.log("");
    console.log("Logging into Firebase:");
    console.log("");
    console.log("  > login [--file=<JSON filename>] [--env=<environment-variable>]");
    console.log("");
    console.log("    The specified filename should be a JSON file with the Firebase authentication.");
    console.log("    The specified environment variable should point to the JSON file.");
    console.log("    One of [file|env] must be specified");
    console.log("");
    console.log("Getting the contents of a document:");
    console.log("");
    console.log("  > cat <collection/document> [--out=<filename>]");
    console.log("");
    console.log("Copying one document to another:");
    console.log("");
    console.log("  > cp <collection/document> <collection/document> [--merge]");
    console.log("");
    console.log("Listing documents in a collection or top-level collections:");
    console.log("");
    console.log("  > ls [<collection>] [--out=<filename>]");
    console.log("");
    console.log("    If <collection> is omitted, top-level collections will be listed.");
    console.log("");
  }

  async handleLoginCommand(args) {
    if (args.file) {
      if (fs.existsSync(args.file)) {
        const json = JSON.parse(fs.readFileSync(args.file).toString());
        this.config.set("firebase_config", json, true, () => {
          this._firebase = new Firebase(this.config);
          this._firestore = new Firestore(this._firebase);
        });
      } else {
        console.log(`Could not find file ${args.file}.`);
      }
    } else if (args.env) {
      console.log("Not yet implemented.");
    } else {
      console.log("usage: login [--file=<JSON filename>] [--env=<environment-variable>]");
    }
  }

  async handleCatCommand(args) {
    if (args._.length === 2) {
      const [collection, document] = args._[1].split("/");
      const data = await this._firestore.get(collection, document);
      if (args.out) {
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        console.log(JSON.stringify(data));
      }
    } else {
      console.log("usage: cat <collection/document> [--out=<filename>]")
    }
  }

  async handleCpCommand(args) {
    if (args._.length === 3) {
      const [c1, d1] = args._[1].split("/");
      const [c2, d2] = args._[2].split("/");
      await this._firestore.copy(c1, d1, c2, d2, args.merge);
    } else {
      console.log("usage: cp <collection/document> <collection/document> [--merge]")
    }
  }

  async handleLsCommand(args) {
    if (args._.length === 1 || args._.length === 2) {
      const data = await this._firestore.list(args._[1]);
      if (args.out) {
        fs.writeFileSync(args.out, JSON.stringify(data));
      } else {
        console.log(JSON.stringify(data));
      }
    } else {
      console.log("usage: ls <collection> [--out=<filename>]")
    }
  }

}

module.exports = Ignis;
