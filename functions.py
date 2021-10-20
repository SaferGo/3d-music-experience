from folunga.models import User
from web_app import db, bcrypt
from flask import session, redirect, jsonify, url_for, render_template, bcrypt
from flask_sqlalchemy import SQLAlchemy


def login(username, password):
    userAccount = User.query.filter_by(username = username).first()
    if userAccount is None:
        return jsonify({'error' : "You have mistyped your username"})

    if not bcrypt.check_password_hash(userAccount.password, password):
        return jsonify({'error' : "Wrong password!"})

    session['id'] = userAccount.id
    session['username'] = userAccount.username
    session['email'] = userAccount.email
    session['password'] = userAccount.password

    return jsonify({'success' : 'Successful login!'})

def register(newUser):
    userExists = User.query.filter_by(username = newUser.username).first()
    emaiExists = User.query.filter_by(email = newUser.email).first()

    if userExists:
        return jsonify({'error' : "Username already taken"})
    if emailExists:
        return jsonify({'error' : "Email already used"})

    db.session.add(newUser)
    db.session.commit()

    return jsonify({'success' : "Account created"})
