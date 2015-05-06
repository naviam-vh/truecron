/**
 * Created by Andrew on 06.05.2015.
 */

var Promise = require("bluebird"),
    _ = require('lodash'),
    models = require('./db/models'),
    cache = require('./cache'),
    history = require('./history'),
    logger = require('../lib/logger'),
    validator = require('../lib/validator'),
    errors = require('../lib/errors'),
    tools = require('./tools'),
    workspaceAccess = require('./workspace-access');

var using = Promise.using;
//
// Payments
//
var findAndCountAll = module.exports.findAndCountAll = Promise.method(function (context, organizationId, options) {
    return workspaceAccess.ensureHasAccess(context, tools.getId(organizationId), workspaceAccess.WorkspaceRoles.Viewer)
        .then(function () {
            options = _.merge(options || {}, {
                where: { organizationId: tools.getId(organizationId) }
            });
            return models.Job.findAndCountAll(options);
        })
        .then(function (result) {
            result.rows.forEach(function(payment) { cache.put(getPaymentIdCacheKey(payment.id), payment); });
            return result;
        })
        .catch(function (err) {
            logger.error('Failed to list payments, %s.', err.toString());
            throw err;
        });
});

/**
 * Create a new payment.
 */
var create = module.exports.create = Promise.method(function (context, attributes) {
    console.log('!!!!11');
    attributes = tools.sanitizeAttributesForCreate(context, attributes);
    if (!attributes.amount) {
        throw new errors.InvalidParams('Payment amount is not specified.');
    }
    if (!attributes.organizationId) {
        throw new errors.InvalidParams('Organization ID is not specified.');
    }
    if (!attributes.paymentMethod) {
        throw new errors.InvalidParams('Payment method is not specified.');
    }
    if (!attributes.receipt) {
        attributes.receipt = 'TEST';
        //throw new errors.InvalidParams('Payment receipt is not specified.');//!!!!!!!
    }
    console.log('!!!!22');

    var locals = { attrs: attributes };
    return using (models.transaction(), function (tx) {
                return models.Payments.create(locals.attrs, { transaction: tx })
            .then(function (payment) {
                locals.payment = payment;
                    return payment;
            })
            .then(function () {
                return Promise.join(
                    history.logCreated(context.personId, {
                        organizationId: locals.payment.organizationId,
                        paymentId: locals.payment.id
                    }, locals.payment, tx),
                    cache.put(getPaymentIdCacheKey(locals.payment.id), locals.payment));
            })
    })
        .catch(function (err) {
            logger.error('Failed to create a payment, %s.', err.toString());
            throw err;
        })
});