#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#

from General.utilities import *
import cgi
import wsgiref.handlers
from General.datastore import *
from google.appengine.ext import webapp
from django.utils import simplejson



class Admin(webapp.RequestHandler):
  def post(self):
    GlobalData.host = urlparse.urlsplit(self.request.url).netloc
    requestObj=simplejson.loads(self.request.body.encode("utf-8"))
    cmd = requestObj["cmd"]
    if cmd == "GetUserList":
      self.response.out.write(simplejson.dumps(self.Admin_GetUsers()))
    elif cmd == "AddUser":
      self.response.out.write(simplejson.dumps(self.Admin_AddUser(requestObj)))
    elif cmd == "RemoveUser":
      self.response.out.write(simplejson.dumps(self.Admin_RemoveUser(requestObj)))
    elif cmd == "GetAppList":
      self.response.out.write(simplejson.dumps(self.Admin_GetApps()))
    elif cmd == "RemoveApp":
      self.response.out.write(simplejson.dumps(self.Admin_RemoveApp(requestObj)))
    elif cmd == "GetFetchCacheURLlist":
      self.response.out.write(simplejson.dumps(self.Admin_GetFetchCacheURLlist()))
    elif cmd == "AddCacheURLs":
      self.response.out.write(simplejson.dumps(self.Admin_AddCacheURLs(requestObj)))
    elif cmd == "RemoveCacheURL":
      self.response.out.write(simplejson.dumps(self.Admin_RemoveCacheURL(requestObj)))
  def Admin_GetUsers(self):
    # feedusers = db.GqlQuery("SELECT * FROM FeedUser")
    feedusers = FeedUser.all()
    result={"result":"User List"}
    result["list"]=[];
    for feeduser in feedusers:
      result["list"].append({"user":feeduser.value.email()})
    return result;

  def Admin_AddUser(self, requestObj):
    Nodes = requestObj["list"]
    for node in Nodes:
      if getUser(users.User(node["user"])) : continue
      newuser = FeedUser(value=users.User(node["user"]))
      newuser.put()
    return {}

  def Admin_RemoveUser(self, requestObj):
    FeedUser = requestObj["user"]
    # userss = User +" --  "
    feeduser = getUser(users.User(FeedUser))
    if feeduser:
      feeduser.delete()
    return {}
  def Admin_GetApps(self):
    # feedusers = db.GqlQuery("SELECT * FROM UserApply")
    feedusers = UserApply.all()
    result={"result":"Apply User List"}
    result["list"]=[];
    for feeduser in feedusers:
      result["list"].append({"user":feeduser.value.email()})
    return result;
  def Admin_RemoveApp(self, requestObj):
    FeedUser = requestObj["user"] 
    # userss = User +" --  "
    feeduser = getApply(users.User(FeedUser))
    if feeduser:
      feeduser.delete()
    return {}
  def Admin_GetFetchCacheURLlist(self):
    FetchList = CachedFetchList.all()
    result={"result":"FetchCacheURLlist"}
    result["list"]=[];
    for fetchurl in FetchList:
      result["list"].append({"url":fetchurl.url,"key":str(fetchurl.key())})
    return result;
  def Admin_AddCacheURLs(self, requestObj):
    URLs = requestObj["list"]
    for URL in URLs:
      newuURL = CachedFetchList(url=URL["url"])
      newuURL.put()
    return {}
  def Admin_RemoveCacheURL(self, requestObj):
    URL = db.get(requestObj["key"])
    if URL != None:
      URL.delete()
    return {}
    

application = webapp.WSGIApplication([
  ('/Admin/Admin.py', Admin)
], debug=True)


def main():
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()

# vim:tabstop=2 expandtab shiftwidth=2 
