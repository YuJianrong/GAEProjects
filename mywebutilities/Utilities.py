#!/usr/bin/env python
#

from google.appengine.api import urlfetch
import re

def Fetch2(url):
  result = urlfetch.fetch(url=url, deadline=10)
  if result.status_code == 200:
    return result
  else:
    return urlfetch.fetch(url=url, deadline=10)
  

def FetchPageUtf8(url, thecodec):
  result = Fetch2(url)
  if result.status_code == 200:
    matchResult = re.search(r'charset\s*=\s*([^''" ]*)', result.content, re.M)
    character = False
    if matchResult :
      character = matchResult.group(1)
      processStr = result.content.replace(character,'utf-8')

    if thecodec:
      character = thecodec
    if character:
      if character.strip() == "gb2312":
        character = "gb18030"
      UnicodeStr = processStr.decode(character)
      Utf8Str = UnicodeStr.encode('utf-8')
    else:
      Utf8Str = result.content
      # do nothing
      # charset = 'utf8'
    return Utf8Str
  else:
    return None

def removeDesc(url):
  result = Fetch2(url)
  if result.status_code == 200:
    re_descObj = re.compile(r'<description>.*?</description>',re.S|re.I)
    return re_descObj.sub("",result.content , 1000)
  else:
    return None

  

# vim:tabstop=2 expandtab shiftwidth=2 
