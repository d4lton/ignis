/**
 * Copyright ©2022 Dana Basken
 */

class Firestore {

  constructor(firebase) {
    this._firebase = firebase;
  }

  async get(collection, document) {
    const snapshot = await this._firebase.app.firestore().collection(collection).doc(document).get();
    if (snapshot.exists) {
      return snapshot.data();
    }
  }

  async put(collection, document, data, merge = false) {
    await this._firebase.app.firestore().collection(collection).doc(document).set(data, {merge: merge});
  }

  async copy(c1, d1, c2, d2, merge = false) {
    const data = await this.get(c1, d1);
    if (data) {
      await this.put(c2, d2, data, merge);
    }
  }

  async list(collection) {
    let snapshot;
    if (!collection) {
      const collections = await this._firebase.app.firestore().listCollections();
      return collections.map(it => it.id);
    } else {
      snapshot = await this._firebase.app.firestore().collection(collection).get();
      return snapshot.docs.map(it => it.exists ? `${collection}/${it.id}` : undefined).filter(it => it);
    }
  }

}

module.exports = Firestore;
