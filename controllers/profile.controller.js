exports.getUser = function (req, res, next) {
    try {
        const user = req.user;
        res.status(200).json({
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not get user', error });
    }
};

exports.updateUser = async (req, res, next) => {

    /*
    const userEmail = req.body.selectedUser;
    const { password } = req.body;
    const currentUser = req.user.email;
    console.log(req.body);
    try {
        if (req.body.place === 'dashboard') {
            // update a user by its email
            if (!req.body)
                return res
                    .status(400)
                    .send({ message: 'Data to update cannot be empty!' });

            if (password)
                return res.status(400).send({ message: 'Cannot update password' });

            // Update user based on email
            await UserModel.findOneAndUpdate({ email: userEmail }, req.body, {
                useFindAndModify: false,
            }).then(data => {
                if (!data) {
                    res.status(404).send({
                        message: `Cannot update user with email=${userEmail}. Maybe the user was not found`,
                    });
                } else {
                    res.status(200).send({ data });
                }
            });
        } else {
            if (req.body.email)
                return res
                    .status(400)
                    .send({ message: 'Cannot update password or email' });

            // Update user based on email
            await UserModel.findOneAndUpdate({ email: currentUser }, req.body, {
                useFindAndModify: false,
            }).then(data => {
                if (!data) {
                    res.status(404).send({
                        message: `Cannot update user with email=${currentUser}. Maybe the user was not found`,
                    });
                } else {
                    res.status(200).send({ data });
                }
            });
        }
    } catch (error) {
        next(error);
    }*/
};
