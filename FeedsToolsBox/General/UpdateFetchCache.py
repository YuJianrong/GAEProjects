#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#
import cgi
import wsgiref.handlers

from General.utilities import *
from General.datastore import *
from google.appengine.ext import webapp

from google.appengine.api import memcache


    
class UpdateFetchCache(webapp.RequestHandler):
  def get(self):
    now = datetime.datetime.utcnow()

    # oldItems = db.GqlQuery("SELECT * FROM FetchCache WHERE accessdate < :1", now - datetime.timedelta(weeks=1))
    # for item in oldItems:
    #   item.delete()

    FetchList = CachedFetchList.all()
    # FetchList = [CachedFetchList(url="http://alexyuprivate.vicp.net/")]
    rpcs=[]
    for Fetchurl in FetchList:
      rpc = urlfetch.create_rpc(deadline=15)
      urlfetch.make_fetch_call(rpc, Fetchurl.url)
      rpcs.append((Fetchurl.url, rpc))
    for rpc_t in rpcs:
      url = rpc_t[0]
      try:
        result = rpc_t[1].get_result()
      except:
        pass
      else:
        if result.status_code == 200:
          # CachedFetch = FetchCache.get_or_insert(url)
          # CachedFetch.updatedate = now;
          # CachedFetch.accessdate = now;
          # CachedFetch.content = db.Blob(result.content)
          # CachedFetch.put()
          memcache.set(url, result.content, 65*60)
    self.response.out.write("OK")

    
application = webapp.WSGIApplication([
  ('/General/UpdateFetchCache', UpdateFetchCache)
], debug=True)


def main():
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()

# vim:tabstop=2 expandtab shiftwidth=2 

