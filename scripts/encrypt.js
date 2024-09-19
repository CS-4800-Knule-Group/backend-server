const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Erorr hashing password: ', error);
    }
};

// TODO: Modify this compare. only needs 1 parameter of plain, hashedPass should be grabbed from db
// const comparePasswords = async (plainPassword, hashedPassword) => {
//     try {
//         const match = await bcrypt.compare(plainPassword, hashedPassword);
//         return match;
//     } catch (error) {
//         console.error('Erorr comparing passwords: ', error);
//     }
// };

module.exports = { hashPassword }