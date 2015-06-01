#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#
import cgi
import wsgiref.handlers
from General.datastore import *
from google.appengine.ext import webapp
from django.utils import simplejson
from ControlCenter.Links2Feed import *
import os
from ControlCenter import FeedFilters
from ControlCenter import ContentExtend
import sys
import traceback
import re


class HomePage(webapp.RequestHandler):
  def get(self): 
    self.user=getUser(users.User())
    if self.user:

      f=open(os.path.join(os.path.dirname(__file__),"Control.html"),"rb")
      HtmlContent=f.read()
      f.close()
      Loc_All = re.findall("{LOC:(.*?)\|(.*?)}", HtmlContent)

      getLocData = self.request.get("getLocData")
      if getLocData != "":
        exec("from ControlCenter.LocData_"+getLocData+" import *")
        locDict={}
        for i in range(0,len(Loc_All)):
          if LocData.has_key(Loc_All[i][0]):
            locDict[Loc_All[i][0]]={"loc":LocData[Loc_All[i][0]]}
          else:
            locDict[Loc_All[i][0]]={"loc":""}
        retList=[]
        for i in range(0,len(Loc_All)):
          if locDict.has_key(Loc_All[i][0]):
            retList.append({"tag":Loc_All[i][0], "en":Loc_All[i][1],"loc":locDict[Loc_All[i][0]]['loc']})
            locDict.pop(Loc_All[i][0])
        self.response.out.write( simplejson.dumps(retList,ensure_ascii=False))
        return

      HtmlAll = re.split("{LOC:.*?\|.*?}",HtmlContent)
      HtmlFinal=HtmlAll[0]

      language = self.user.lang
      # language = "en"

      if language == "en":
        for i in range(0,len(Loc_All)):
          HtmlFinal = HtmlFinal + Loc_All[i][1] + HtmlAll[i+1]
      else:
        exec("from ControlCenter.LocData_"+language+" import *")
        for i in range(0,len(Loc_All)):
          if LocData.has_key(Loc_All[i][0]):
            HtmlFinal = HtmlFinal + LocData[Loc_All[i][0]]
          else:
            HtmlFinal = HtmlFinal + Loc_All[i][1]
          HtmlFinal = HtmlFinal +  HtmlAll[i+1]
      
      self.response.out.write( HtmlFinal % {"UserAccount":users.User().email(), "LogoutLink":users.create_logout_url("/")})
    else:
      f=open(os.path.join(os.path.dirname(__file__),"Control_unauthorized.html"),"rb")
      self.response.out.write( f.read() % {"LogoutLink":users.create_logout_url("/")})
      f.close()
    
class ControlCenter(webapp.RequestHandler):
  def post(self):
    try:
      GlobalData.host = urlparse.urlsplit(self.request.url).netloc
      requestObj=simplejson.loads(self.request.body.decode("utf-8"))
      cmd = requestObj["cmd"]
      if cmd == "ApplyPermission":
        self.response.out.write(simplejson.dumps(self.Control_ApplyPermission()))
      else:
        self.user = getUser(users.User())
        if not self.user:
          return
        else:
          if cmd == "SetLang": 
            self.response.out.write(simplejson.dumps(self.SetLang(requestObj)))
          elif cmd == "GetConfigList":
            self.response.out.write(simplejson.dumps(self.GetConfigList()))
          elif cmd == "GetPublicConfigList":
            self.response.out.write(simplejson.dumps(self.GetPublicConfigList()))
          elif cmd == "RemoveConfig":
            self.response.out.write(simplejson.dumps(self.RemoveConfig(requestObj)))
          elif cmd == "SaveConfig":
            self.response.out.write(simplejson.dumps(self.SaveConfig(requestObj)))
          elif cmd == "GetConfig":
            self.response.out.write(simplejson.dumps(self.GetConfig(requestObj)))
          elif cmd == "GetLink2FeedPreview":
            self.response.out.write(simplejson.dumps(self.GetLink2FeedPreview(requestObj)))
          elif cmd == "GetFeedFilterPreview":
            self.response.out.write(simplejson.dumps(self.GetFeedFilterPreview(requestObj)))
          elif cmd == "GetContentExtendPreview":
            self.response.out.write(simplejson.dumps(self.GetContentExtendPreview(requestObj)))
          elif cmd == "GetFeedUrl":
            self.response.out.write(simplejson.dumps(self.GetFeedUrl(requestObj)))
          pass
    except :
       self.response.out.write(simplejson.dumps( {"error":sys.exc_info()[1].__class__.__name__,
          "message":str(sys.exc_info()[1]), 
          "callstack":"".join(traceback.format_tb(sys.exc_info()[2]))} ))
  def SetLang(self, requestObj):
    self.user.lang=requestObj["lang"]
    self.user.put()
    return {"result":"SetLang", 'state':'ok'}
  def Control_ApplyPermission(self):
    if not getApply(users.User()):
      newUserApply = UserApply(value=users.User())
      newUserApply.put()
    return {}
  def SaveConfig(self, requestObj):
    if requestObj["isNew"]:
      newConfig = ToolConfig(owner=users.User(), url=requestObj["url"] ,type=requestObj["type"], isPublic=requestObj["isPublic"], isPublicAccount=requestObj["isPublicAccount"], configuration=simplejson.dumps(requestObj["config"]) )
      newConfig.put()
      key = str(newConfig.key())
      returnFeedURL=self.GetFeedUrl({"key":key})["FeedURL"]
    else:
      oldConfig=db.get(requestObj["key"])
      if oldConfig == None:
        raise Exception("config not found")
      else:
        if oldConfig.owner != users.User():
          raise Exception("permission denied")
      oldConfig.url=requestObj["url"]
      oldConfig.isPublic=requestObj["isPublic"]
      oldConfig.isPublicAccount=requestObj["isPublicAccount"]
      oldConfig.configuration = simplejson.dumps(requestObj["config"])
      oldConfig.put()
      key = str(oldConfig.key())
      returnFeedURL=self.GetFeedUrl({"key":key})["FeedURL"]
    result={"result":"SaveConfig", 'FeedURL':returnFeedURL, 'key':key}
    return result
  def GetFeedUrl(self, requestObj):
    theConfig=db.get(requestObj["key"])
    result={"result":"GetFeedUrl"}
    if theConfig == None:
      raise Exception("config not found")
    else:
      if (not theConfig.isPublic) and theConfig.owner != users.User():
        raise Exception("permission denied")
    result["FeedURL"]="/get_"+theConfig.type+"?key="+str(theConfig.key())
    return result
  def GetConfigList(self):
    theConfigs = db.GqlQuery("SELECT * FROM ToolConfig WHERE owner = :1", users.User())
    result={"result":"GetConfigList", "list":[]}
    for theConfig in theConfigs:
      config = simplejson.loads(theConfig.configuration)
      result["list"].append({"name":config["name"], "type":theConfig.type, "url":str(theConfig.url), "key":str(theConfig.key()), "isPublic":theConfig.isPublic})
    return result
  def GetPublicConfigList(self):
    theConfigs = db.GqlQuery("SELECT * FROM ToolConfig WHERE isPublic = TRUE AND owner != :1", users.User())
    result={"result":"GetPublicConfigList", "list":[]}
    for theConfig in theConfigs:
      config = simplejson.loads(theConfig.configuration)
      config_info= {"name":config["name"], "type":theConfig.type, "url":str(theConfig.url), "key":str(theConfig.key())}
      if theConfig.isPublicAccount:
        config_info["creator"]=str(users.User().email())
      result["list"].append(config_info)
    return result
  def RemoveConfig(self, requestObj):
    theConfig=db.get(requestObj["key"])
    if theConfig != None:
      if theConfig.owner != users.User():
        raise Exception("permission denied")
      theConfig.delete()
    return {}
  def GetConfig(self, requestObj):
    theConfig=db.get(requestObj["key"])
    result={"result":"GetConfig"}
    if theConfig == None:
      raise Exception("config not found")
    else:
      if theConfig.isPublic:
        result["readonly"] = theConfig.owner != users.User()
      elif theConfig.owner != users.User():
        raise Exception("permission denied")
      result["url"]=theConfig.url
      result["type"]=theConfig.type
      result["isPublic"]=theConfig.isPublic
      result["isPublicAccount"]=theConfig.isPublicAccount
      result["config"]=simplejson.loads(theConfig.configuration)
    return result
  def GetLink2FeedPreview(self, requestObj):
    return GetFilterLinks(ConvertToUnicode(cachedFetch(requestObj["url"], requestObj["config"]["cookie"])),requestObj["url"],requestObj["config"] )
  def GetFeedFilterPreview(self, requestObj):
    HtmlContent = cachedFetch(requestObj["url"])
    coloredItmes=FeedFilters.getColoredItems(HtmlContent, requestObj["config"]["filters"])
    result={"result":"GetFeedFilterPreview"}
    result["list"]=[]
    for entry in coloredItmes.entries:
      result["list"].append({"color":entry.color, "title":entry.title})
    return result
  def GetContentExtendPreview(self, requestObj):
    FeedContent = ContentExtend.getContentExtend(requestObj["url"],requestObj["config"]["Pattern"], requestObj["previewNum"] )
    result={"result":"GetContentExtendPreview"}
    result["list"]=[]
    for entry in FeedContent.entries:
      if entry.has_key("htmlContent"):
        result["list"].append({"htmlContent":entry.htmlContent})
      # result["list"].append({"htmlContent":entry.title})
    return result





application = webapp.WSGIApplication([
  ('/', HomePage),
  ('/ControlCenter/Control', ControlCenter)
], debug=True)


def main():
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()

# vim:tabstop=2 expandtab shiftwidth=2 

