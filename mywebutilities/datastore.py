
from google.appengine.ext import db
from google.appengine.api import users

class Url(db.Model):
  value = db.StringProperty()
  date = db.DateTimeProperty(auto_now_add=True)

urls = db.GqlQuery("SELECT * FROM Url")

def getUrl(urlvalue):
  for url in urls:
    if url.value == urlvalue:
      return url
  return False

class IpInfo(db.Model):
  theUser = db.UserProperty(auto_current_user=True)
  date = db.DateTimeProperty()
  theIp = db.StringProperty()


# vim:tabstop=2 expandtab shiftwidth=2 
