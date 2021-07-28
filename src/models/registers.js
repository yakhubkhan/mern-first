const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        unique: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//------------generating tokens

employeeSchema.methods.generateAuthToken = async function () {

    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;


    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }

}
//--------converting password into Hash

employeeSchema.pre("save", async function (next) {

    if (this.isModified("password")) {

        // console.log(`the current password id  ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`the current password id  ${this.password}`);

        // this.conformpassword = undefined;
    }

    next();
})


//  now we need to create collection

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;