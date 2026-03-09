const { db } = require("../../config/firebase");

exports.createUser = async (user) => {
    await db.collection("users").doc(user.id).set(user);
};