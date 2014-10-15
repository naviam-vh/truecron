var express = require('express'),
    _ = require('lodash'),
    logger = require('../../lib/logger'),
    validator = require('../../lib/validator'),
    storage = require('../storage'),
    apiErrors = require('./../../lib/errors'),
    common = require('./common');

var api = express.Router();

function personToUser(person) {
    if (person === undefined) {
        return person;
    }
    var user = person.toJSON();
    var selfUrl = '/users/' + user.id;
    user._links = {
        self: selfUrl,
        organizations: selfUrl + '/organizations',
        history: selfUrl + '/history'
    };
    delete user.passwordHash;
    return { user: user };
}

function personEmailToEmail(personId, email) {
    if (email === undefined) {
        return email;
    }
    var result = email.toJSON();
    var selfUrl = '/users/' + personId + '/emails/' + email.id;
    result._links = {
        self: selfUrl
    };
    delete result.personId;
    return { email: result };
}

api.route('/users')
    //
    // List of users
    //
    .get(common.parseListParams, function (req, res, next) {
        var where = {};
        if (!!req.listParams.searchTerm) {
            where = { name: { like: req.listParams.searchTerm } };
        }
        var sort = req.listParams.sort || 'name';

        storage.Person.findAndCountAll({
            where: where,
            order: sort + ' ' + req.listParams.direction,
            limit: req.listParams.limit,
            offset: req.listParams.offset
        }).then(function (result) {
            res.json({
                users: result.rows.map(personToUser),
                meta: {
                    total: result.count
                }});
        });
    })
    //
    // Create a new user
    //
    .post(function (req, res, next) {
        if (!req.body || !req.body.user) {
            return next(new apiErrors.InvalidParams());
        }
        storage.Person.create(req.body.user)
        .then(function (person) {
            res.status(201).json(personToUser(person));
        })
        .catch(function (err) {
            logger.error(err);
            return next(new apiErrors.InvalidParams(err));
        });
    });

//
// :userid can be specified as an integer ID or an email.
//
api.param('userid', function (req, res, next, id) {
    // Allow to specify both ID and email
    var personId = null;
    var email = null;
    if (validator.isInt(id)) {
        personId = id;
    } else if (validator.isEmail(id)) {
        email = id;
    } else {
        next(new apiErrors.InvalidParams());
    }

    if (!!personId) {
        storage.Person.findById(id)
            .then(function (person) {
                if (person !== null) {
                    req.Person = person;
                    next();
                } else {
                    next(new apiErrors.NotFound());
                }
            });
    } else {
        storage.Person.findByEmail(email)
            .then(function (person) {
                if (person !== null) {
                    req.Person = person;
                    next();
                } else {
                    next(new apiErrors.NotFound());
                }
            });
    }
});

api.route('/users/:userid')
    //
    // Get a user
    //
    .get(function (req, res, next) {
        res.json(personToUser(req.Person));
    })
    //
    // Update a user
    //
    .put(function (req, res, next) {
        if (!req.body || !req.body.user) {
            return next(new apiErrors.InvalidParams());
        }
        storage.Person.update(req.Person.id, req.body.user)
            .then(function (person) {
                res.json(personToUser(person));
            });
    })
    //
    // Delete a user
    //
    .delete(function (req, res, next) {
        storage.Person.remove(req.Person.id)
            .then(function () {
                res.status(204).json({});
            });
    });

//
// User emails
//
api.route('/users/:userid/emails')
    //
    // Get email addresses of the user :userid
    //
    .get(common.parseListParams, function (req, res, next) {
        var where = {};
        if (!!req.listParams.searchTerm) {
            where = { email: { like: req.listParams.searchTerm } };
        }
        var sort = req.listParams.sort || 'id';

        storage.Person.getEmails(req.Person.id, {
            where: where,
            order: sort + ' ' + req.listParams.direction,
            limit: req.listParams.limit,
            offset: req.listParams.offset
        })
        .then(function (result) {
            res.json({
                emails: result.rows.map(_.partial(personEmailToEmail, req.Person.id)),
                meta: {
                    total: result.count
                }});
        });
    })
    //
    // Add a new email address for the user :userid
    //
    .post(function (req, res, next) {
        if (!req.body || !req.body.email) {
            return next(new apiErrors.InvalidParams());
        }
        storage.Person.addEmail(req.Person.id, req.body.email)
            .then(function (email) {
                res.status(201).json(personEmailToEmail(req.Person.id, email));
            })
            .catch(function (err) {
                logger.error(err);
                return next(err);
            });
    });


//
// :email can be specified as an integer ID or as a email.
//
api.param('email', function (req, res, next, id) {
    if (!validator.isInt(id) && !validator.isEmail(id)) {
        next(new apiErrors.InvalidParams());
    }
    storage.Person.findEmail(req.Person.id, id)
        .then(function (email) {
            if (!!email) {
                req.Email = email;
                next();
            } else {
                next(new apiErrors.NotFound());
            }
        });
});


api.route('/users/:userid/emails/:email')
    //
    // Get an email address of the user :userid
    //
    .get(function (req, res, next) {
        res.json(personEmailToEmail(req.Person.id, req.Email));
    })
    //
    // Change status of the email address (pending, active)
    //
    .put(function (req, res, next) {
        if (!req.body || !req.body.email || !req.body.email.status) {
            return next(new apiErrors.InvalidParams());
        }
        storage.Person.changeEmailStatus(req.Person.id, req.Email.id, req.body.email.status)
            .then(function (email) {
                res.json(personEmailToEmail(req.Person.id, email));
            })
            .catch(function (err) {
                logger.error(err);
                return next(err);
            });
    })
    //
    // Delete the email of the user
    //
    .delete(function (req, res, next) {
        storage.Person.removeEmail(req.Person.id, req.Email.id)
            .then(function () {
                res.status(204).json({});
            });
    });



module.exports = api;