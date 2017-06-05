import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    'firstName': String,
    'lastName': String
});

AccountSchema.plugin(passportLocalMongoose, {
    'usernameField': 'email',
    'usernameQueryFields': ['email'],
    'errorMessages': {
        'IncorrectPasswordError': 'The password you\'ve entered is incorrect.',
        'IncorrectUsernameError': 'The email you\'ve entered doesn\'t match any account.',
        'UserExistsError': 'The email you\'ve entered is already associated with another account.',
        'MissingPasswordError': 'Please enter a password.',
        'MissingUsernameError': 'Please enter a valid email address.'
    }
});

module.exports = mongoose.model('Account', AccountSchema);
