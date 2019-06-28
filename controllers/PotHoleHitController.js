const PotHoleHit = require('../Models/PotHoleHit');

const log = require('simple-node-logger');

// create a rolling file logger based on date/time that fires process events
const logger_opts = {
    errorEventName:'error',
    logDirectory:'./logs', // NOTE: folder must exist and be writable...
    fileNamePattern:'dtp-<DATE>.log',
    dateFormat:'YYYY.MM.DD'
};

const logger = log.createRollingFileLogger(logger_opts);
exports.index = function(req, res) {
    res.send('NOT IMPLEMENTED: Site Home Page');
};

// Display list of all potholes.
exports.pothole_list = function(req, res) {
    res.send("NOT IMPLEMENTED: pothole list");
};

// Display pothole hits recorded within a given date range
exports.pothole_list_by_date_range = function(req, res) {
    res.send(`NOT IMPLEMENTED: pothole list: ${req.params.start_date} ${req.params.end_date}`);
};

// Display pothole hits recorded within before or after a given number of days
exports.pothole_list_by_day_range = function(req, res) {
    res.send(`NOT IMPLEMENTED: pothole list: ${req.params.num_days} ${req.params.older_than}`);
};

// Display detail page for a specific pothole.
exports.pothole_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: pothole detail: ' + req.params.id);
};

// Handle pothole hit create on POST.
exports.pothole_create_post = function(req, res) {
    if (!req.body) {
        logger.warn('No Request Body in Hit POST');
        res.send({response: 'ERROR'});
        return;
    }
    logger.info('New Hit Received: ',req.body);
    PotHoleHit.create(req.body).then(function (bump) {
        bump.respone = "OK";
        res.send(bump);
    })
};
