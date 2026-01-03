import bcrypt


def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def check_password(stored_password, provided_password):
    return bcrypt.checkpw(provided_password.encode('utf-8'),
                          stored_password.encode('utf-8'))
