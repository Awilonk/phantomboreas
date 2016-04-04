import config
import sqlalchemy

engine = sqlalchemy.create_engine(config.SQLALCHEMY_DATABASE_DEFINITION) # connect to server
engine.execute("CREATE DATABASE IF NOT EXISTS app") #create db