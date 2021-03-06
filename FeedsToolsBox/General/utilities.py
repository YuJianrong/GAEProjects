#!/usr/bin/env python
#
# Copyright 2010 Yu Jianrong, All Rights Reserved
#
# Licensed under BSD License.
#

from google.appengine.ext import db
from google.appengine.api import urlfetch
# from datetime import *
import datetime
import re
import logging
import sys
import urlparse
from General.datastore import *

from google.appengine.api import memcache


class GlobalData():
  host=""


def Fetch2(url, cookie=None):
  if cookie != None:
    Headers={'cookie':cookie}
  else:
    Headers={}
  result = urlfetch.fetch(url=url, deadline=10, headers=Headers)
  if result.status_code == 200:
    return result.content
  else:
    return urlfetch.fetch(url=url, deadline=10, headers=Headers).content

def getCacheKey(url, cookie=None):
  return url+ ( ("?"+cookie) if cookie != None else "")

def cachedFetch(url, cookie=None):
  urlObject = urlparse.urlparse(url);
  if urlObject.netloc == GlobalData.host:
    # no cache for same host
    if re.match("/get",urlObject.path):
      from ControlCenter import Result
      parameters = urlObject.query.split("&")
      QueryObject = {}
      for parameter in parameters:
        equaPos = parameter.find('=')
        QueryObject[parameter[:equaPos]] = parameter[equaPos+1:]
      return Result.get(QueryObject).get("Body")
    else:
      try:
        return Fetch2(url, cookie)
      except Exception:
        raise Exception( "Cannot fetch the target url [" + url +"]")

  # now = datetime.datetime.utcnow()
  # CachedFetch = FetchCache.get_by_key_name(getCacheKey(url,cookie))

  # if CachedFetch != None :
  #   if now - CachedFetch.updatedate < datetime.timedelta(minutes=65):  # cache hit when less than 65 minutes
  #     CachedFetch.accessdate = now
  #     CachedFetch.put()
  #     return CachedFetch.content

  CachedFetch = memcache.get(getCacheKey(url,cookie))
  if CachedFetch != None :
    return CachedFetch

  try:
    result = Fetch2(url, cookie)
  except Exception:
    # something bad happend, return the old result if possible
    # if (CachedFetch != None) and CachedFetch.content:
    #   CachedFetch.accessdate = now
    #   CachedFetch.put()
    #   return CachedFetch.content
    # else:
    #   raise Exception( "Cannot fetch the target url [" + url +"]")
    raise Exception( "Cannot fetch the target url [" + url +"]")

  if result != "":
    # if CachedFetch == None:
    #   CachedFetch = FetchCache(key_name=getCacheKey(url,cookie))
    # CachedFetch.content = db.Blob(result)
    # CachedFetch.cookie = cookie
    # CachedFetch.updatedate = now
    # CachedFetch.accessdate = now
    # CachedFetch.put()
    memcache.set(getCacheKey(url,cookie), result, 65*60)

  return result


def cachedLoad(url, cookie=None):
  if urlparse.urlsplit(url).netloc == GlobalData.host:
    # no cache for same host
    return False

  CachedFetch = memcache.get(getCacheKey(url,cookie))
  if CachedFetch != None :
    return CachedFetch

  return False

  # CachedFetch = FetchCache.get_by_key_name(getCacheKey(url,cookie))
  # if (CachedFetch is None) or ((not cookie is None) and (cookie != CachedFetch.cookie)):
  #   return False
  # now = datetime.datetime.utcnow()
  # if now - CachedFetch.updatedate < datetime.timedelta(minutes=65):  # cache hit when less than 65 minutes
  #   CachedFetch.accessdate = now
  #   CachedFetch.put()
  #   return CachedFetch.content
  # return False


def ConvertToUnicode(HTMLpage):
  # logging.error("HTMLPageL" + str(HTMLpage))
  # return ""
  Ret = re.search('charset=\s*[\'"]?(.*?)[\'"\s]',HTMLpage, re.I)
  if Ret:
    Encoding = Ret.group(1)
  else:
    Encoding = "utf8"
  try:
    return HTMLpage.decode(Encoding)
  except :
    # raise(Exception(HTMLpage))
    if Encoding.upper() == "GB2312":
      return HTMLpage.decode("gb18030","ignore")
    else:
      # raise(Exception(sys.exc_info()[1]))
      return HTMLpage.decode(Encoding,"ignore")

def MultiFetch(URLList):
  FetchResult={}
  rpcs=[]
  for URL in URLList:
    # raise(Exception(URL))
    cacheReault=cachedLoad(URL)
    if cacheReault:
      FetchResult[URL] = cacheReault
    else:
      rpc = urlfetch.create_rpc(deadline=10)
      urlfetch.make_fetch_call(rpc, URL)
      rpcs.append((URL, rpc))
  URLList = []
  for rpc_t in rpcs:
    URL = rpc_t[0]
    try:
      result = rpc_t[1].get_result()
    except:
      URLList.append(URL)
    else:
      if result.status_code == 200:
        FetchResult[URL] = result.content
        if urlparse.urlsplit(URL).netloc != GlobalData.host:
          # CachedFetch = FetchCache.get_or_insert(URL)
          # CachedFetch.content = db.Blob(result.content)
          # CachedFetch.cookie = None
          # CachedFetch.updatedate = datetime.datetime.utcnow()
          # CachedFetch.accessdate = datetime.datetime.utcnow()
          # CachedFetch.put()
          memcache.set(URL, result.content, 65*60)

  rpcs=[]
  for URL in URLList:
    rpc = urlfetch.create_rpc(deadline=10)
    urlfetch.make_fetch_call(rpc, URL)
    rpcs.append((URL, rpc))
  for rpc_t in rpcs:
    URL = rpc_t[0]
    try:
      result = rpc_t[1].get_result()
    except:
      pass
    else:
      if result.status_code == 200:
        FetchResult[URL] = result.content
        if urlparse.urlsplit(URL).netloc != GlobalData.host:
          # CachedFetch = FetchCache.get_or_insert(URL)
          # CachedFetch.content = db.Blob(result.content)
          # CachedFetch.cookie = None
          # CachedFetch.updatedate = datetime.datetime.utcnow()
          # CachedFetch.accessdate = datetime.datetime.utcnow()
          # CachedFetch.put()
          memcache.set(URL, result.content, 65*60)
  return FetchResult




# vim:tabstop=2 expandtab shiftwidth=2 

