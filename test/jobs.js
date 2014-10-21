/**
 * Created by vitalihatalski on 10/17/14.
 */
var superagent = require('superagent');
var expect     = require('expect.js');
var config     = require('../lib/config.js');
var log        = require('../lib/logger.js');
var prefix     = config.get('API_HOST') || 'http://localhost:3000/api/v1';

describe('JOBS API',
    function() {
        var id_to_delete;

        it('create a job', function (done) {
            superagent.post(prefix + '/jobs')
                .set('Content-Type', 'application/json')
                .send({ 'job': {
                    'workspaceId':'1',
                    'name': "TestName",
                    'tags': ["edi", "production"],
                    'updatedByPersonId':'1',
                    'startsAt': "2014-08-21T10:00:11Z",
                    'rrule': "FREQ=DAILY;INTERVAL=1;BYDAY=MO;BYHOUR=12;BYMINUTE=0;BYSECOND=0"
                }
                })
                .auth('-2', 'Igd7en1_VCMP59pBpmEF')
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
                    id_to_delete = res.body.job.id;
                    expect(res.status).to.eql(201);
                    done();
                });
        });

        it('get all jobs', function(done) {
            superagent.get(prefix + '/jobs')
                .send()
                .auth('-2', 'Igd7en1_VCMP59pBpmEF')
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
                    expect(res.status).to.eql(200);
                    done();
                });
        });

        it('get one job id=99999 should fail', function(done) {
            superagent.get(prefix + '/jobs/99999')
                .send()
                .auth('-2', 'Igd7en1_VCMP59pBpmEF')
                .end(function (e, res) {
                    expect(e).to.eql(null);
                    expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
                    expect(res.status).to.eql(404);
                    done();
                });
        });

//        it('delete job', function (done) {
//            superagent.del(prefix + '/jobs/' + id_to_delete)
//                .send()
//                .auth('-2', 'Igd7en1_VCMP59pBpmEF')
//                .end(function (e, res) {
//                    expect(e).to.eql(null);
//                    expect(res.body.error).to.eql(undefined);
//                    expect(res.status).to.eql(204);
//                    done();
//                });
//        });


//        it('create a job', function (done) {
//            superagent.post(prefix + '/organizations/1/workspaces/1/jobs')
//                .send({
//                    "name": "My first job",
//                    "tags": ["edi", "production"],
//                    "startsAt": "2014-08-21T10:00:11Z",
//                    "rrule": "FREQ=DAILY;INTERVAL=1;BYDAY=MO;BYHOUR=12;BYMINUTE=0;BYSECOND=0"
//                })
//                .end(function (e, res) {
//                    expect(e).to.eql(null);
//                    expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
//                    expect(res.status).to.eql(201);
//                    expect(res.body.job.id).to.be.a('number');
//                    done();
//                });
//        });
//
//        it('create a job with name only', function (done) {
//            superagent.post(prefix + '/jobs')
//                .send({
//                    "name": "My first job"
//                })
//                .auth('-2', 'Igd7en1_VCMP59pBpmEF')
//                .end(function (e, res) {
//                    expect(e).to.eql(null);
//                    console.dir(res.body);
//                    expect(res.header['content-type']).to.eql('application/json; charset=utf-8');
//                    expect(res.status).to.eql(201);
//                    expect(res.body.job.id).to.be.a('number');
//                    done();
//                });
//        });
    });