/*
 * Copyright 2010 Yu Jianrong, All Rights Reserved
 * 
 * Licensed under BSD License.
 */

var pageLoading=
{
    _initialize_:function()
    {
        this.div=$("page_Loading");
    },
    Unload: function() { },
    Load: function() { }
};

var pageAdmin=
{
    _initialize_:function()
    {
        this.div=$("page_Admin");
        $("Btn_AddUser").addEvent('click', this.AddUser.bind(this));
        $("Btn_AddFetchCacheURLs").addEvent('click', this.AddFetchCacheURLs.bind(this));
    },
    Unload: function()
    {
        // clear the list
        $("Lst_Users").empty();
        $("Lst_Applications").empty();
        $("Lst_FetchCacheURLs").empty();
    },
    Load: function()
    {
        this.Unload();
        this.Update();
    },
    Update:function()
    {
        var Users = getResult("/Admin/Admin.py", {cmd:"GetUserList"});
        var div=$("Lst_Users");
        Users.list.each(function(user)
        {
            var li=new Element("li");
            li.appendText(user.user);
            li.appendChild(new Element("input",{type:"button", value:"Remove"})).addEvent('click',this.RemoveUser.bind(this, user.user));
            div.appendChild(li);
        }.bind(this));

        var Applications =getResult("/Admin/Admin.py",{cmd:"GetAppList"}); 
        var div=$("Lst_Applications");
        Applications.list.each( function (app)
        {
            var li = new Element("li");
            li.appendText(app.user);
            li.appendChild(new Element("input",{ type:"button", value:"Remove" })).addEvent('click',this.RemoveApp.bind(this,app.user));
            li.appendChild(new Element("input",{ type:"button", value:"Permit" })).addEvent('click',this.PermitApp.bind(this,app.user));
            div.appendChild(li);
        }.bind(this));

        var FetchCacheURLs =getResult("/Admin/Admin.py",{cmd:"GetFetchCacheURLlist"}); 
        var div=$("Lst_FetchCacheURLs");
        FetchCacheURLs.list.each( function (url)
        {
            var li = new Element("li");
            li.appendText(url.url);
            li.appendChild(new Element("input",{ type:"button", value:"Remove" })).addEvent('click',this.RemoveCacheURL.bind(this,url.key));
            div.appendChild(li);
        }.bind(this));
    },
    AddUser: function()
    {
        getResult("/Admin/Admin.py", {cmd:"AddUser", list:$("Txt_NewUser").value.split('\n').map(function(user){return {'user':user};})});
        $("Txt_NewUser").value="";
        this.Unload();
        this.Update();
    },
    RemoveApp: function(appUser)
    {
        getResult("/Admin/Admin.py", {cmd:"RemoveApp", "user":appUser});
        this.Unload();
        this.Update();
    },
    PermitApp: function(appUser)
    {
        getResult("/Admin/Admin.py", {cmd:"AddUser", list:[{user:appUser}]});
        getResult("/Admin/Admin.py", {cmd:"RemoveApp", "user":appUser});
        this.Unload();
        this.Update();
    },
    RemoveUser: function (user)
    {
        getResult("/Admin/Admin.py", {cmd:"RemoveUser", "user":user});
        this.Unload();
        this.Update();
    },
    AddFetchCacheURLs: function()
    {
        getResult("/Admin/Admin.py", {cmd:"AddCacheURLs", list:$("Txt_FetchCacheURLs").value.split('\n').map(function(url){return {'url':url};})});
        $("Txt_FetchCacheURLs").value="";
        this.Unload();
        this.Update();
    },
    RemoveCacheURL: function(key)
    {
        getResult("/Admin/Admin.py", {cmd:"RemoveCacheURL", "key":key});
        this.Unload();
        this.Update();
    }
};


function Init()
{
    pageManager = new pageManagerClass(pageLoading);
    pageManager.gotopage(pageAdmin);
}
window.addEvent('domready', Init);




