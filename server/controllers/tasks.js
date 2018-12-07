const cwd = process.cwd();
const debug = require('debug')('controllers:tasks');

module.exports = class Task {
  constructor(model = false) {
    this._model = model;
  }

  get model() {
    return this._model;
  }

  index() {
    return new Promise((resolve, reject) => {
      this.model
        .scan()
        .exec()
        .then(tasks => {
          if (!tasks) {
            resolve([]);
          } else {
            resolve(tasks);
          }
        })
        .catch(reject);
    });
  }

  show(req) {
    return new Promise((resolve, reject) => {
      this.model.query({ task_id: req.params.id }, (err, task) => {
        if (err) {
          reject(err);
        } else {
          resolve(task);
        }
      });
    });
  }

  create(req) {
    return new Promise((resolve, reject) => {
      this.model.create(
        {
          ...req.body,
        },
        (err, task) => {
          if (err) {
            reject(err);
          } else {
            resolve(task);
          }
        }
      );
    });
  }

  update(req) {
    return new Promise((resolve, reject) => {
      this.model.update(
        { task_id: req.params.id },
        { ...req.body },
        (err, task) => {
          if (err) {
            reject(err);
          } else {
            resolve(task);
          }
        }
      );
    });
  }

  destroy(req) {
    return new Promise((resolve, reject) => {
      this.model.delete(
        { task_id: req.params.id },
        { update: true },
        (err, task) => {
          if (err) {
            reject(err);
          } else {
            resolve(task);
          }
        }
      );
    });
  }
};
