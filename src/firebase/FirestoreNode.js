const {Utilities, ObjectUtilities} = require("@d4lton/utilities");

class FirestoreNode {

  constructor(path, app) {
    this._app = app;
    const parts = path?.split("/")?.filter(it => it) || [];
    this._path = parts.join("/");
    this._property = undefined;
    if (parts.length === 0) {
      this._type = "root";
    } else if (parts.length % 2 === 0) {
      this._type = "document";
      const match = this._path.match(/^(.+?)!(.+)$|^(.+)$/);
      if (match) {
        const parts = match.filter(it => it);
        this._path = parts[1];
        this._property = parts[2];
      }
      this._ref = this._app.firestore().doc(this._path);
    } else {
      this._type = "collection";
      this._ref = this._app.firestore().collection(this._path);
    }
  }

  async list() {
    switch (this._type) {
      case "root": return (await this._app.firestore().listCollections()).map(it => it.id);
      case "document": return (await this._ref.listCollections()).map(it => `${this._path}/${it.id}`);
      case "collection": return (await this._ref.get()).docs.filter(it => it.exists).map(it => `${this._path}/${it.id}`);
    }
  }

  async get() {
    if (this._type === "document") {
      const snapshot = await this._ref.get();
      if (snapshot?.exists) {
        const data = snapshot.data();
        if (this._property) {
          return ObjectUtilities.getDottedKeyValue(this._property, data);
        } else {
          return data;
        }
      }
    } else {
      throw new Error(`Cannot read data from a collection at path "${this._path}"`);
    }
  }

  async delete() {
    if (this._type === "document") {
      this._ref.delete();
      } else {
      throw new Error(`Cannot delete a collection at path "${this._path}"`);
    }
  }

  async put(data, merge = false) {
    if (this._type === "document") {
      if (this._property) {
        const snapshot = await this._ref.get();
        let document;
        if (snapshot.exists) {
          document = snapshot.data();
        } else {
          document = {};
        }
        ObjectUtilities.setDottedKeyValue(this._property, data, document);
        await this._ref.set(document, {merge: merge});
      } else {
        data = Utilities.isObject(data) ? data : JSON.parse(data);
        await this._ref.set(data, {merge: merge});
      }
    } else {
      throw new Error(`Cannot store data in a collection at path "${this._path}"`);
    }
  }

}

module.exports = FirestoreNode;
