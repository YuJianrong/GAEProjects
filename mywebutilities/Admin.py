#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import cgi
import datetime
import wsgiref.handlers

from datastore import *

from google.appengine.ext import webapp

from xml.dom.minidom import *

minidomimpl = getDOMImplementation()


class Admin(webapp.RequestHandler):
  def post(self):
    xmlDoc = parseString(self.request.get('data').encode("utf-8"))
    xmlRoot = xmlDoc.documentElement
    cmd = xmlRoot.getAttribute("cmd")
    if cmd == "GetUrls":
      self.response.out.write(self.Admin_GetUrls())
    elif cmd == "AddUrl":
      self.response.out.write(self.Admin_AddUrl(xmlRoot))
    elif cmd == "RemoveUrl":
      self.response.out.write(self.Admin_RemoveUrl(xmlRoot))
    elif cmd == "GetIPUpdate":
      self.response.out.write(self.getIPUpdate())
    self.response.headers["Content-Type"]="application/xml"
  def Admin_GetUrls(self):
    OutXML = minidomimpl.createDocument(None,"Result",None)
    OutRoot = OutXML.documentElement
    OutRoot.setAttribute( "status", "OK")
    for url in urls:
      nodeurl = OutXML.createElement("Url")
      nodeurl.setAttribute("Value", url.value)
      OutRoot.appendChild(nodeurl)
    return OutXML.toxml("utf-8")

  def Admin_AddUrl(self, Root):
    Nodes = Root.getElementsByTagName("Url")
    for node in Nodes:
      if getUrl(node.getAttribute("Value")) : continue
      newurl = Url(value=node.getAttribute("Value"))
      newurl.put()
    OutXML = minidomimpl.createDocument(None,"Result",None)
    OutRoot = OutXML.documentElement
    OutRoot.setAttribute( "status", "OK")
    return OutXML.toxml("utf-8")

  def Admin_RemoveUrl(self, xmlRoot):
    Url = xmlRoot.getAttribute("UrlValue");
    # urlss = Url +" --  "
    for url in urls:
      # urlss = urlss + "," + url.value
      if url.value == Url:
        url.delete()
        break
    OutXML = minidomimpl.createDocument(None,"Result",None)
    OutRoot = OutXML.documentElement
    OutRoot.setAttribute( "status", "OK")
    # raise urlss.encode("utf-8")
    return OutXML.toxml("utf-8")
  def getIPUpdate(self):
    OutXML = minidomimpl.createDocument(None,"Result",None)
    OutRoot = OutXML.documentElement

    theIpUsers = db.GqlQuery("SELECT * FROM IpInfo WHERE theUser = :1", users.User())
    if theIpUsers.count() != 0:
      for theIpUser in theIpUsers:
        OutRoot.setAttribute("date", str(theIpUser.date))
        OutRoot.setAttribute("IP", theIpUser.theIp)
    return OutXML.toxml("utf-8")
    

application = webapp.WSGIApplication([
  ('/Admin.py', Admin)
], debug=True)


def main():
  wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
  main()

# vim:tabstop=2 expandtab shiftwidth=2 
