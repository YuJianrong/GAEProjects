#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#
import re
from General.utilities import *
from General import feedparser


def getColoredItems(HtmlContent, oriFileters):
  filters=list(oriFileters)
  #build the re object
  for filter in filters:
    filter["reObj"]=re.compile(filter["FilterPattern"],re.S|re.I|re.U)
  #parse the feed
  feed = feedparser.parse(HtmlContent)
  for entry in feed.entries:
    entry["color"]="grey"
    for filter in filters:
      if filter["reObj"].search(entry.title):
        entry.color=filter["color"]
        if filter["SkipBelow"]:
          break;
  return feed



# vim:tabstop=2 expandtab shiftwidth=2 
