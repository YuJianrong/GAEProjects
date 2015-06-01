#!/usr/bin/env python
#

from Utilities import *
from datastore import *
import re
import datetime
import urllib
from urlparse import urlparse

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import users

def isURLAllowed(url):
  for Allowurl in urls:
    if re.compile(Allowurl.value, re.I).match(url):
      return True
  return False

class getUtf8Page(webapp.RequestHandler):
  def get(self):
    urlstr = urllib.unquote(self.request.get('url'))
    LocalCodec = self.request.get('codec')
    if not isURLAllowed(urlstr):
      self.response.out.write("No pemission for this URL")
      self.error(500)
      return
    result = FetchPageUtf8(urlstr, LocalCodec)
    if result:
      self.response.headers['Content-Type'] = 'text/html'
      self.response.out.write(result)
    else:
      self.error(500)

class RemoveDesc(webapp.RequestHandler):
  def get(self):
    urlstr = urllib.unquote(self.request.get('url'))
    if not isURLAllowed(urlstr):
      self.response.out.write("No pemission for this URL")
      self.error(500)
      return
    result = removeDesc(urlstr)
    if result:
      self.response.headers["Content-Type"]="application/xml"
      self.response.out.write(result)
    else:
      self.error(500)

class RefChange(webapp.RequestHandler):
  def get(self):
    refRoot = self.request.get('ref')
    urlstr = urllib.unquote(self.request.get('url'))
    if not isURLAllowed(urlstr):
      self.response.out.write("No pemission for this URL")
      self.error(500)
      return
    if not refRoot:
      up = urlparse(urlstr)
      refRoot = up.scheme + "://" + up.netloc
    result = urlfetch.fetch(url=urlstr, deadline=10, headers={"Referer":refRoot})
    for var in result.headers:
      self.response.headers[var] = result.headers[var]
    self.response.out.write(result.content)
    # self.response.out.write(str(result.headers))

class UpdateIP(webapp.RequestHandler):
  def get(self):
    theIpUsers = db.GqlQuery("SELECT * FROM IpInfo WHERE theUser = :1", users.User())
    if theIpUsers.count() != 0:
      for theIpUser in theIpUsers:
        theIpUser.date = datetime.datetime.utcnow()
        theIpUser.theIp = self.request.remote_addr
        theIpUser.put()
    else:
      theIpUser = IpInfo( theIp = self.request.remote_addr, date = datetime.datetime.utcnow())
      theIpUser.put()
    self.response.out.write(self.request.remote_addr + "<br>" + str(datetime.datetime.utcnow()))
    # self.response.out.write(str(result.headers))

application = webapp.WSGIApplication( [
  (r'/GetUtf8Page.*', getUtf8Page),
  (r'/RemoveDesc.*', RemoveDesc),
  (r'/RefChange.*', RefChange),
  (r'/UpdateIP.*', UpdateIP)
  ], debug=True)

def main():
  run_wsgi_app(application)


if __name__ == "__main__":
  main()

# vim:tabstop=2 expandtab shiftwidth=2 

