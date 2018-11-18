const cwd = process.cwd();
const router = require('express').Router();
const debug = require('debug')('routes:tasks');
const Model = require(`${cwd}/models/tasks.js`)();
const Controller = new (require(`${cwd}/controllers/tasks.js`))(Model);

router.use(function timeLog(req, res, next) {
  console.log('Tasks routes at: ', Date.now());
  next();
});

router.get('/', (req, res, next) => {
  Controller.index(req)
    .then(tasks => res.json({ tasks: tasks }))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Controller.create(req)
    .then(task => res.status(201).json(task))
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  Controller.show(req)
    .then(task => res.json({ task: task }))
    .catch(err => next(err));
});

router.patch('/:id', (req, res, next) => {
  Controller.update(req)
    .then(task => res.json(task))
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  Controller.destroy(req)
    .then(task => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;
