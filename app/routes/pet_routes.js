// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Pet = require('../models/pet')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /examples
router.get('/pets', requireToken, (req, res, next) => {
  const id = req.user.id
  Pet.find({ owner: id })
    .then(pets => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return pets.map(pet => pet.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(pets => res.status(200).json({ pets }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.post('/pets/show', requireToken, (req, res, next) => {
  // store pet name in variable
  const name = req.body.pet.name

  Pet.findOne({ name: name })
    .then(handle404)
    // if `findById` is succesful, respond with 200 and pet JSON
    .then(pet => res.status(200).json({ pet: pet.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/pets', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  req.body.pet.owner = req.user.id
  Pet.create(req.body.pet)
    // respond to succesful `create` with status 201 and JSON of new pet
    .then(pet => {
      res.status(201).json({ pet: pet.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/pets/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.pet.owner
  // store old name in variable
  const id = req.params.id

  // allow user to find pet by name
  Pet.findOneAndUpdate({ _id: id }, req.body.pet, { new: true })
    .then(handle404)
    .then(pet => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      console.log(pet)
      return requireOwnership(req, pet)
    })
    // if that succeeded, return 201 and JSON
    .then(pet => res.status(201).json({ pet: pet.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/pets/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  Pet.findById(id)
    .then(handle404)
    .then(pet => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, pet)
      // delete the example ONLY IF the above didn't throw
      pet.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
