from sqlalchemy import Column, String, Integer, Date, Text

from red_light_green_light.base import Base

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String(20), nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    password = Column(Text, nullable=False)

    def __repr__(self):
        return f"User('{self.username}', '{self.password}')"
