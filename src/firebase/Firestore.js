/**
 * Copyright ©2022 Dana Basken
 */

const FirestoreNode = require("./FirestoreNode");

class Firestore {

  constructor(firebase) {
    this._firebase = firebase;
  }

  async get(path) {
    try {
      const node = new FirestoreNode(path, this._firebase.app);
      return node.get();
    } catch (error) {}
  }

  async put(path, data, merge = false) {
    const node = new FirestoreNode(path, this._firebase.app);
    await node.put(data, merge);
  }

  async copy(source, destination, merge = false) {
    const data = await this.get(source);
    if (data) {
      await this.put(destination, data, merge);
    }
  }

  async delete(path) {
    const node = new FirestoreNode(path, this._firebase.app);
    await node.delete();
  }

  async list(path) {
    const node = new FirestoreNode(path, this._firebase.app);
    return node.list();
  }

}

module.exports = Firestore;
