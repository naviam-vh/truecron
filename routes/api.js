/**
 * Created by Andrew on 30.09.2014.
 */

var express = require('express');
var path = require('path');
var router = express.Router();
var log = require('../lib/logger');
var config = require('../lib/config');
var pg = require('pg');

var conString = "postgres://" +
    config.get('POSTGRE_USERNAME') +
    ":" + config.get('POSTGRE_PASSWORD') + "@" +
    config.get('POSTGRE_HOST') +
    ":" + config.get('POSTGRE_PORT')
    + "/" + config.get('POSTGRE_DATABASE');

log.info(conString);

router.get('/organizations/:org_id/workspaces/:workspace_id/jobs', function(req, res) {
    var organization_id = req.param('org_id');
    var workspace_id = req.param('workspace_id');


    debugger;
    var archived = req.param('archived', 0); // default: 0
    var active = req.param('active', 1); // default: 1
    var tags_job = req.param('tags');
    var sort = req.param('sort', 'name');
    var direction = req.param('direction', 'asc');
    var wherefordb;

    if(!tags_job){
        wherefordb='WHERE active='+active+' AND archived='+archived+' AND workspaceId='+workspace_id+' AND organizationId='+organization_id+' ORDER BY '+sort+' '+direction+';';
    }
    else {
        wherefordb='WHERE active='+active+' AND archived='+archived+' AND workspaceId='+workspace_id+' AND organizationId='+organization_id+' AND tag='+tags_job+'  ORDER BY '+sort+' '+direction+';';
    }

    log.info('org id: ' + organization_id);
    log.info('workspace id: ' + workspace_id);
    log.info('archived: ' + archived);
    log.info('active: ' + active);
    log.info('tags: ' + tags_job);
    log.info('sort: ' + sort);
    log.info('direction: ' + direction);

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query('SELECT tc.Job.id, tc.Job.workspaceId, tc.Job.name, tc.Job.active, tc.Job.archived, tc.Job.createdAt, ' +
                'tc.Job.updatedAt, tc.Job.updatedByPersonId, tc.Job.startsAt, tc.Job.rrule FROM tc.Job, ' +
                'tc.Workspace '+wherefordb,
            function (err, result) {
                if (err) {
                    return console.error('error running query', err);
                }

                res.json({ "jobs": result.rows });

                client.end();
            });

    });
});

module.exports = router;

/*post*/
var workspaceId, name, archived, updatedByPersonId, rrule;
router.use(express.bodyParser());
router.post('/organizations/:org_id/workspaces/:workspace_id/jobs', function(req, res) {
    workspace_id = req.param('workspace_id');
    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('could not connect to postgres', err);
        }
        client.query('insert into tc.Job (workspaceId, name, archived, updatedByPersonId, rrule) values ($1, $2, $3, $4, $5);', [workspaceId, name, archived, updatedByPersonId, rrule], /*add parse json*/
            function (err, result) {
                if (err) {
                    return console.error('error running query', err);
                }

                console.log(req.body);

                client.end();
            });

    });


});

/*put*/

