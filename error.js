var errorHandler = function (err, req, res, next) {
    'use strict'
    if (err) {

        if (err.name === 'UnauthorizedError') {
            return res.status(401).send('invalid token...');
        }
        console.error(err.stack);
        return res.status(500).send(err);
    } else {
        next();
    }
};

var errorHelper = function () {
    'use strict'
    var parameterError = function (parameterName) {
        var error = {
            'name': 'ParameterError',
            'message': 'Parameter "' + parameterName + '" value required.'
        };
        return error;
    };

    var unauthorizedError = function (message) {
        return {
            'name': 'UnauthorizedError',
            'message': message
        };
    };

    var untrustedTokenError = function () {
        return {
            'name': 'untrustedTokenError',
            'message': 'Suplied token is not trustworthy'
        };
    };

    return {
        parameterError: parameterError,
        unauthorizedError: unauthorizedError,
        untrustedTokenError: untrustedTokenError
    };
};

module.exports = {
    errorHandler: errorHandler,
    errorHelper: errorHelper
};