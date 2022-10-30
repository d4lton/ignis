class FirestoreNode {

  constructor(path, app) {
    this._app = app;
    const parts = path?.split("/")?.filter(it => it) || [];
    this._path = parts.join("/");
    if (parts.length === 0) {
      this._type = "root";
    } else if (parts.length % 2 === 0) {
      this._type = "document";
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
        return snapshot.data();
      }
    }
  }

  async put(data, merge = false) {
    if (this._type === "document") {
      await this._ref.set(data, {merge: merge});
    }
  }

}

module.exports = FirestoreNode;
