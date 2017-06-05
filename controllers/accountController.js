import passport from 'passport';

import Account from '../models/account';

exports.register = (req, res) => {
    Account.register(new Account({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }), req.body.password, (err, account) => {
        if(err) {
            return res.status(400).send({
                'err': err
            });
        }

        passport.authenticate('local')(req, res, () => {
            return res.status(200).send({
                '_id': req.user._id,
                '__v': req.user.__v,
                'email': req.user.email,
                'firstName': req.user.firstName,
                'lastName': req.user.lastName
            });
        });
    })
}

exports.login = (req, res, next) => {
    if(req.isAuthenticated()) {
        return res.status(400).send({
            'message': 'You are already logged in.'
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if(err) {
            return next(err);
        }

        if(!user) {
            return res.status(401).send({
                'err': info
            });
        }

        req.logIn(user, (err) => {
            if(err) {
                return res.status(500).send({
                    'message': 'A problem was encountered when you were logging in.'
                })
            }

            return res.status(200).send(req.user);
        });
    })(req, res, next);
}

exports.logout = (req, res) => {
    if(!req.isAuthenticated()) {
        return res.status(400).send({
            'message': 'You are not logged in.'
        });
    }

    req.logout()
    return res.status(200).send({
        'message': 'Succesfully logged out.'
    });
}

exports.status = (req, res) => {
    return res.status(200).send(req.isAuthenticated() ? req.user : null);
}
