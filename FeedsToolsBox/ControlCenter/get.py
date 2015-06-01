#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#

from ControlCenter import Result
from General import PyRSS2Gen
from General.utilities import *
from google.appengine.ext import webapp
import cgi
import urlparse
import urlparse
import wsgiref.handlers

    

class MainHandler(webapp.RequestHandler):
  def get(self):
    GlobalData.host = urlparse.urlsplit(self.request.url).netloc
    result = Result.get(self.request)
    self.response.headers["Content-Type"] = result.get("MIME");
    self.response.out.write(result.get("Body"))
    

application = webapp.WSGIApplication([
  ('/get.*', MainHandler)
], debug=True)


def main():
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()

# vim:tabstop=2 expandtab shiftwidth=2 


