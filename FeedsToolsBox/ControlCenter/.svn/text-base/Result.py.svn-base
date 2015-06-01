#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#

import re

from ControlCenter import ContentExtend
from ControlCenter import FeedFilters
from ControlCenter.Links2Feed import *
from General import PyRSS2Gen
from General.datastore import *
from General.utilities import *
from django.utils import simplejson

def get(query):
  # GlobalData.host = urlparse.urlsplit(self.request.url).netloc
  theKey = query.get("key")
  # get the entity
  theTool=db.get(theKey)
  if theTool == None:
    # self.response.out.write("The tools is invalid")
    # self.error(500)
    return
  config = simplejson.loads(theTool.configuration)
  if theTool.type == 'RemoveDescription':
    return removeDesc(theTool,config)
  if theTool.type == 'Links2Feed':
    return Links2Feed(theTool,config)
  if theTool.type == 'FeedFilters':
    return l_FeedFilters(theTool,config, query)
  if theTool.type == 'ContentExtend':
    return l_ContentExtend(theTool,config)

def removeDesc(theTool,config):
  content = cachedFetch(theTool.url)
  re_descObj = re.compile(r'<description>.*?</description>',re.S|re.I)
  return {"MIME": "application/xml",
      "Body": re_descObj.sub("",content , 1000)}
  # self.response.headers["Content-Type"]="application/xml"
  # self.response.out.write(re_descObj.sub("",content , 1000))

def Links2Feed(theTool,config):
  if config.has_key("UseLinkAsGUID"):
    UseLinkAsGUID = config["UseLinkAsGUID"]
  else:
    UseLinkAsGUID = True
  FilteredLinks = GetFilterLinks(ConvertToUnicode(cachedFetch(theTool.url, config["cookie"])),theTool.url,config)
  rss = PyRSS2Gen.RSS2(
    title=FilteredLinks["title"],
    link=theTool.url,
    description=FilteredLinks["title"] )
  for link in FilteredLinks["links"]:
    rss.items.append(PyRSS2Gen.RSSItem(link['desc'],link['link'], guid=link['link'] if UseLinkAsGUID else link['desc'] ))
  return {"MIME": "application/xml",
      "Body": rss.to_xml('utf-8') }
  # self.response.headers["Content-Type"]="application/xml"
  # self.response.out.write(rss.to_xml('utf-8'))

def l_FeedFilters(theTool,config, query):
  # theColors=self.request.get("color").split(' ')
  theColors=query.get("color").split(' ')
  # import logging
  # logging.error("color: "+self.request.get("color"))
  # logging.error("title: "+(self.request.get("title")).decode("utf-8"))
  if query.get("title") != "":
    theTitle = query.get("title")
  else:
    theTitle = None

  HtmlContent = cachedFetch(theTool.url)
  coloredItmes=FeedFilters.getColoredItems(HtmlContent, config["filters"])

  #filled the RSS
  if theTitle == None:
    title=coloredItmes.feed.title
  else:
    title=theTitle

  link=coloredItmes.feed.link
  if coloredItmes.feed.has_key("subtitle"):
    description = coloredItmes.feed.subtitle
  else:
    description = ""
  rss = PyRSS2Gen.RSS2(
    title,
    link,
    description,
    language=coloredItmes.feed.get("language"),
    copyright=coloredItmes.feed.get("rights"),
    managingEditor=coloredItmes.feed.get("author"),
    webMaster=coloredItmes.feed.get("publisher"),
    pubDate=coloredItmes.feed.get("updated"),
    generator=GlobalData.host)

  for entry in coloredItmes.entries:
    if not entry.color in theColors:
      continue
    enclosures=[]
    if entry.has_key("enclosures"):
      for enclosure in entry.enclosures:
        enclosures.append(PyRSS2Gen.Enclosure(enclosure.get("href"),enclosure.get("length"),enclosure.get("type")))
    rss.items.append(PyRSS2Gen.RSSItem(
      title=entry.get("title"),
      link=entry.get("link"),
      description=entry.get("summary"),
      pubDate = entry.get("updated"),
      guid=entry.get("id"),
      author=entry.get('author'),
      comments=entry.get("comments"),
      enclosures=enclosures
      ))
  return {"MIME": "application/xml",
      "Body": rss.to_xml('utf-8') }
  # self.response.headers["Content-Type"]="application/xml"
  # self.response.out.write(rss.to_xml('utf-8'))

def l_ContentExtend(theTool,config):
  FeedContent = ContentExtend.getContentExtend(theTool.url,config["Pattern"]  )
  result={"result":"GetContentExtendPreview"}
  result["list"]=[]

  rss = PyRSS2Gen.RSS2(
    title=FeedContent.feed.title,
    link=FeedContent.feed.link,
    description=FeedContent.feed.description,
    language=FeedContent.feed.get("language"),
    copyright=FeedContent.feed.get("rights"),
    managingEditor=FeedContent.feed.get("author"),
    webMaster=FeedContent.feed.get("publisher"),
    pubDate=FeedContent.feed.get("updated"),
    generator=GlobalData.host) 

  for entry in FeedContent.entries:
    enclosures=[]
    if entry.has_key("enclosures"):
      for enclosure in entry.enclosures:
        enclosures.append(PyRSS2Gen.Enclosure(enclosure.get("href"),enclosure.get("length"),enclosure.get("type")))
    if entry.has_key("htmlContent"):
      desc = entry.htmlContent
    else:
      desc = entry.get("summary")
    rss.items.append(PyRSS2Gen.RSSItem(
      entry.title, 
      entry.link, 
      desc,
      pubDate = entry.get("updated"),
      guid=entry.get("id"),
      author=entry.get('author'),
      comments=entry.get("comments"),
      enclosures=enclosures
      ))
  return {"MIME": "application/xml",
      "Body": rss.to_xml('utf-8') }
  # self.response.headers["Content-Type"]="application/xml"
  # self.response.out.write(rss.to_xml('utf-8'))


# vim:tabstop=2 expandtab shiftwidth=2 


