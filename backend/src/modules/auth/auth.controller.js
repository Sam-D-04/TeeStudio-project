const login = async (req, res, next) => {
    // Logic: Ki?m tra email/pass -> Generate JWT -> Return User
};

const register = async (req, res, next) => {
    // Logic: Hash password -> Save to DB
};

const logout = async (req, res, next) => {
    // Logic: Xóa refresh token (n?u luu ? DB/Redis)
};

module.exports = { login, register, logout };
