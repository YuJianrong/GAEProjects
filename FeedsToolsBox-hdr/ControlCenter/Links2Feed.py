#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#

import urllib2
import re
import urlparse
from General.utilities import *

def GetAllLinks(HTMLContent, URL, Base):
  AllLinks = re.findall("<\\s*a.*?href\\s*=\\s*['\"](.*?)['\"].*?>(.*?)<\\s*/a\\s*>",HTMLContent,re.S|re.I)
  urlpart=urlparse.urlsplit(URL)
  URLRoot=urlparse.urlunsplit( (urlpart[0],urlpart[1],"","",""))
  Ret=re.search("(.*/).*?",urlpart[2])
  if Ret:
    path=Ret.group(1)
  else:
    path="/"
  if Base:
    URLSamePath = Base
  else:
    URLSamePath=urlparse.urlunsplit( (urlpart[0],urlpart[1],path,"","") )
  if URLSamePath[len(URLSamePath)-1] != "/":
    URLSamePath += "/"

  RetLinks=[]
  for Link in AllLinks:
    if not re.match("^http", Link[0], re.I):
      if re.match("^/", Link[0]):
        FullLink=URLRoot+Link[0]
      else:
        FullLink=URLSamePath+Link[0]
    else:
      FullLink=Link[0]
    RetLinks.append({'link':FullLink, 'desc':Link[1]})
  return RetLinks

def GetFilterLinks(HtmlContent,url, configObj):
  # get title
  if configObj['title']=="":
    TitleReRslt = re.search(r"<\s*title\s*>(.*)<\/\s*title\s*>" , HtmlContent, re.I)
    if TitleReRslt:
      title = TitleReRslt.group(1)
    else:
      title = ""
  else:
    title = configObj['title']

  baseResult=re.search(r"<base\s+href\s*=\s*['\"](.*?)['\"]", HtmlContent, re.I )
  if baseResult:
    URLBase = baseResult.group(1)
  else:
    URLBase = None

  if  configObj['MainPattern']!= "":
    reo = re.search(configObj['MainPattern'], HtmlContent, re.S|re.I|re.M)
    if reo:
      HtmlContent = reo.group(0)
    else:
      raise "SectionPattern Error"

  AllLinks = GetAllLinks(HtmlContent , url, URLBase)
  if configObj["LinkInclude"]=="":
    reLinkInclude=re.compile('.' , re.S|re.I|re.M)
  else:
    reLinkInclude=re.compile(configObj["LinkInclude"] , re.S|re.I|re.M)
  reLinkExclude=re.compile(configObj["LinkExclude"] , re.S|re.I|re.M)
  if configObj["DescInclude"]=="":
    reDescInclude=re.compile('.' , re.S|re.I|re.M)
  else:
    reDescInclude=re.compile(configObj["DescInclude"] , re.S|re.I|re.M)
  reDescExclude=re.compile(configObj["DescExclude"] , re.S|re.I|re.M)
  FilteredLinks=[]
  for Link in AllLinks:
    if not reLinkInclude.search(Link["link"]):
      continue
    if configObj["LinkExclude"]!="":
      if reLinkExclude.search(Link["link"]):
        continue

    if not reDescInclude.search(Link["desc"]):
      continue
    if configObj["DescExclude"]!="":
      if reDescExclude.search(Link["desc"]):
        continue
      
    FilteredLinks.append(Link)
  return {'title':title, 'links':FilteredLinks}




# vim:tabstop=2 expandtab shiftwidth=2 

