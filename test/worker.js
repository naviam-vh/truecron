/**
 * Created by estet on 10/23/14.
 */
var expect     = require('expect.js');
var validator  = require('validator');
var config     = require('../lib/config.js');
var log        = require('../lib/logger.js');
var smtpTask   = require('../backend/api/worker/smtptask');
var jobRunner  = require('../backend/api/worker/jobRunner');
var FtpTask    = require('../backend/api/worker/ftptask');
var FtpConnection = require('../backend/api/worker/ftpConnection');

var mailTask;
var ftpTask;

describe('Email task',
    function() {
        it ('has run', function (done) {
            mailTask = new smtpTask('sergey.sokur@truecron.com', 'sergey.sokur@truecron.com', 'Test', 'Text', '<b>Html</b>');
            mailTask.run(function(){
                expect(mailTask.status).not.to.eql('waiting');
                done();
            });
        });
    });

describe('Ftp task',
    function()
    {
        it('has run', function(done)
        {
            ftpTask = new FtpTask(new FtpConnection('ftp.darvision.com', 'anonymous', '@anonymous'), [['ls','.'],'LIST']);
            ftpTask.run(function(){
                expect(ftpTask.status).not.to.eql('waiting');
                done();
            });
        });
    });