#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#
import re
from General.utilities import *
from General import feedparser


def getContentExtend(RssUrl,Pattern, FetchNumber=None):
  #get the feed
  FeedContent = cachedFetch(RssUrl)
  feed = feedparser.parse(FeedContent)
  FetchList=[]
  Num=0
  reObj=re.compile(Pattern,re.M|re.S|re.U)
  reObj_noScriptAll = re.compile("<script.*?<\/script>", re.M|re.S|re.U|re.I)
  for entry in feed.entries:
    FetchList.append(entry["link"])
    Num = Num +1
    if (not FetchNumber is None) and FetchNumber == Num:
      break;
  FetchResult = MultiFetch(FetchList)
  for entry in feed.entries:
    if FetchResult.has_key(entry["link"]):
      htmlContent=ConvertToUnicode(FetchResult[entry["link"]])
      noScriptAll = reObj_noScriptAll.split(htmlContent)
      htmlContent = " ".join(noScriptAll)
      reResult = reObj.search(htmlContent)
      if reResult:
        if len(reResult.groups()) != 0:
          entry["htmlContent"]= reResult.group(1)
        else:
          entry["htmlContent"]= reResult.group(0)

  return feed
  

# vim:tabstop=2 expandtab shiftwidth=2 
