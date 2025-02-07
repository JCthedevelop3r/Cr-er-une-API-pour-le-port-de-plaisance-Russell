const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function authenticate(req, res, next) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password -__v -createdAt -updatedAt');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(403).json({ message: 'Wrong credentials' });

        const userObject = user.toObject();
        delete userObject.password;

        const token = jwt.sign(
            { user: userObject }, 
            process.env.SECRET_KEY, 
            { expiresIn: '24h' }
        );

        res.setHeader('Authorization', `Bearer ${token}`);
        return res.status(200).json({ message: 'Authentication successful', token });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
}

module.exports = { authenticate };