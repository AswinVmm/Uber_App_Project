exports.registerUser = async (req, res) => {
    const user = {
        id: req.userId,
        role: req.body.role,
        createdAt: new Date(),
        rating: 5
    };

    await userService.createUser(user);
    res.json(user);
};