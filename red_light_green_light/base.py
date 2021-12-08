from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

POSTGRES = {
    'user' : 'santi',
    'pw' : 'angelita2012',
    'db' : 'rg_light',
    #'host' : 'localhost',
    #'host' : 'db',
    'host' : '35.228.217.7',
    'port' : '5432'
}

engine = create_engine('postgresql://%(user)s:%(pw)s@%(host)s:\
        %(port)s/%(db)s' % POSTGRES)

Session = sessionmaker(bind=engine)

Base = declarative_base()
