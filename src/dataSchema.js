const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('connected successfully'))
.catch((e) => console.log(e.message));

const data = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    Institute: {
        type: String,
        required: true
    },
    data: {
        type: [{
            id: {
                type: Number,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            parent: {
                type: String,
                required: true
            },
            class: {
                type: String,
                required: true
            },
            from: {
                type: String,
                required: true
            },
            to: {
                type: String,
                required: true
            },
            fee: {
                type: Number,
                required: true
            },
            img: {
                data: String,
                contentType: String
            },
            fromDate: {
                type: String,
                required: true
            },
            toDate: {
                type: String,
                required: true
            },
            Institute: {
                type: String,
                required: true
            }
        }]
    }

})

const Studdata = mongoose.models.stud || mongoose.model('stud', data);
module.exports = Studdata;