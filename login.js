import { Token } from './jwt.js';

const checkLogin = (req, res) => {

    const { username, password } = req.body;
    const token = new Token(username).token;

}

export default checkLogin;

