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

var pageControlCenter=
{
    _initialize_:function()
    {
        this.div=$("page_ControlCenter");
        // add event for the new <a>
        $("newTool_RemoveDescription").addEvent('click', this.NewTool.bindWithEvent(this, [pageRemoveDescription]));
        $("newTool_Links2Feeds").addEvent('click', this.NewTool.bindWithEvent(this, [pageLinks2Feed]));
        $("newTool_FeedFilters").addEvent('click', this.NewTool.bindWithEvent(this, [pageFeedFilters]));
        $("newTool_ContentExtend").addEvent('click', this.NewTool.bindWithEvent(this, [pageContentExtend]));

        $("Main_GetPublicConfig").addEvent('click', this.GetPublicConfig.bindWithEvent(this));
        // $("newTool_ContentExtend").addEvent('click', this.NewTool.bindWithEvent(this, [pageRemoveDescription]));
        $$(".Main_LangSelect").addEvent('click', this.LangSelect);
    },
    Load: function() 
    {
        this.Unload();
        // add the current tools to the list.
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetConfigList"});
        resultObj.list.each((function(theConfig)
        {
            var li=$("Main_li_Tools_proto").getElement("li").clone();
            li.getElement("input[name=edit]").addEvent('click',this.EditConfig.bindWithEvent(this,[theConfig.type,theConfig.key]));
            li.getElement("input[name=remove]").addEvent('click',this.RemoveConfig.bindWithEvent(this,[theConfig.type,theConfig.key]));
            li.getElement("[class=Main_li_Name]").set("text",theConfig.type+"-"+theConfig.name+" ");
            if (theConfig.isPublic) {li.getElement("[class=Main_li_isPublic]").setStyle("display","inline");}
            li.getElement("[class=Main_li_Link]").set("text",theConfig.url);
            $("Lst_CurrentTools").appendChild(li);
        }).bind(this));
    },
    Unload: function() 
    {
        $("Lst_CurrentTools").empty();
        $("Lst_PublicTools").empty();
        $("Main_span_PublicNumber").setStyle('display','none');
    },
    NewTool:function (e)
    {
        e.preventDefault();
        var args = $A(arguments);
        args.shift();
        pageManager.gotopage.apply(pageManager,args);
    },
    EditConfig:function(e,type,key)
    {
        switch(type)
        {
        case "RemoveDescription":
            pageManager.gotopage(pageRemoveDescription,key);
            break;
        case "Links2Feed":
            pageManager.gotopage(pageLinks2Feed,key);
            break;
        case "FeedFilters":
            pageManager.gotopage(pageFeedFilters,key);
            break;
        case "ContentExtend":
            pageManager.gotopage(pageContentExtend,key);
            break;
        }
    },
    RemoveConfig:function(e, type,key)
    {
        if (!confirm($("LocStr_WarningOnRemoveTool").get('text')))
            return;
        getResult("/ControlCenter/Control", {cmd:"RemoveConfig", "key":key});
        this.Load();
    },
    GetPublicConfig:function(e)
    {
        $("Lst_PublicTools").empty();
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetPublicConfigList"});
        resultObj.list.each((function(theConfig)
        {
            var li=$("Main_li_Piblic_proto").getElement("li").clone();
            li.getElement("input[name=visit]").addEvent('click',this.EditConfig.bindWithEvent(this,[theConfig.type,theConfig.key]));
            li.getElement("[class=Main_li_Name]").set("text",theConfig.type+"-"+theConfig.name+" ");
            if (theConfig.creator)
            {
                li.getElement("[class=Main_li_creator]").setStyle("display","inline");
                li.getElement("[class=Main_li_creator_name]").set("text",theConfig.creator);
            }
            li.getElement("[class=Main_li_Link]").set("text",theConfig.url);
            $("Lst_PublicTools").appendChild(li);
        }).bind(this));
        $("Main_span_PublicNumber").setStyle('display','inline');
        $("Main_PublicNumber").set('text',''+resultObj.list.length);
    },
    LangSelect:function()
    {
        getResult("/ControlCenter/Control", {cmd:"SetLang", lang:this.get('data')});
        window.location.reload();
        return false;
    }
};

var pageGeneral=new Class(
{
    initialize: function(thePage)
    {
        this.page = thePage;
        this.page.div.getElement("[class=General_Btn_Exit]").addEvent('click',this.onExitButton.bindWithEvent(this));
        this.page.div.getElement("[class=General_Btn_Clone]").addEvent('click', this.page.clone.bindWithEvent(this.page));
    },
    Load: function( theConfig)
    {
        this.page.div.getElement("[class=General_Input_ConfigName]").value=theConfig.config.name;
        this.page.div.getElement("[class=General_Input_IsPublic]").checked=theConfig.isPublic;
        this.page.div.getElement("[class=General_Input_PublicAccount]").disabled=!this.page.div.getElement("[class=General_Input_IsPublic]").checked;
        this.page.div.getElement("[class=General_Input_PublicAccount]").checked=theConfig.isPublicAccount;
        if (theConfig.readonly)
        {
            this.page.div.getElements("[class=readonlyElement]").setStyle('display','inline');
            this.page.div.getElements("[class=writeonlyElement]").setStyle('display','none');
        }
    },
    Unload: function()
    {
        this.page.div.getElement("[class=General_Input_ConfigName]").value="";
        this.page.div.getElement("[class=General_Input_IsPublic]").checked=false;
        this.page.div.getElement("[class=General_Input_PublicAccount]").checked=false;
        this.page.div.getElement("[class=General_Input_PublicAccount]").disabled=true;
        this.page.div.getElements("[class=readonlyElement]").setStyle('display','none');
        this.page.div.getElements("[class=writeonlyElement]").setStyle('display','inline');
    },
    SetConfigObj:function( theConfig)
    {
        theConfig.config["name"]=this.page.div.getElement("[class=General_Input_ConfigName]").value.trim();
        theConfig.isPublic=this.page.div.getElement("[class=General_Input_IsPublic]").checked;
        if (theConfig.isPublic)
            theConfig.isPublicAccount=this.page.div.getElement("[class=General_Input_PublicAccount]").checked;
        else
            theConfig.isPublicAccount=false;
    },
    onExitButton:function(e)
    {
        if (this.page.modified)
        {
            if (!confirm($("LocStr_WarningOnExitWithoutSave").get('text')))
                return;
        }
        pageManager.gotopage(pageControlCenter);
    }
});

var pageRemoveDescription=
{
    _initialize_:function()
    {
        this.div=$("page_RemoveDescription");
        this.general=new pageGeneral(this);
        $("RD_Input_Set").addEvent('click',this.SetURL.bindWithEvent(this));
        $("RD_Input_GetURL").addEvent('click',this.GetURL.bindWithEvent(this));
        $("RD_Error_EmptyURL").setStyle('opacity',0);
        this.div.getElements("input").addEvent('change',(function(e){this.modified=true;}).bindWithEvent(this));
        this.Unload();
    },
    Load: function(theOldKey) 
    {
        this.Unload();
        this.isNew = (theOldKey === undefined);
        this.key=theOldKey;
        if (!this.isNew)
        {
            // load the config
            var theConfig=getResult("/ControlCenter/Control", {cmd:"GetConfig", "key":theOldKey});
            $("RD_Input_Url").value=theConfig.url;
            this.general.Load(theConfig);
            if (theConfig.readonly)
            {
                $$("#RD_InputURL input").set("disabled",true);
                $$("#RD_InputURL [class=readonlyElement]").set("disabled",false);
                $$("#RD_InputURL [class=ReadonlyEnable]").set("disabled",false);
            }
        }
        this.modified=false;
    },
    Unload: function() 
    {
        $$("#page_RemoveDescription>div").setStyle("display","none");
        $("RD_InputURL").setStyle("display","inline");
        $("RD_Input_Url").value="";
        $$("#RD_InputURL input").set("disabled",false);
        this.general.Unload();
    },
    SetURL:function(e)
    {
        var theURL = $("RD_Input_Url").value.trim();
        if (theURL.length === 0)
        {
            $("RD_Error_EmptyURL").errorHint();
            return;
        }
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:this.isNew, type:"RemoveDescription", config:{} };
        if (!this.isNew) cmdConfig.key=this.key;
        this.general.SetConfigObj(cmdConfig);
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        $("RD_Feed_URL").set('href', resultObj.FeedURL);
        $("RD_InputURL").hide(function(){$("RD_FeedURL").show();});
        this.modified=false;
    },
    clone:function(e)
    {
        var theURL = $("RD_Input_Url").value.trim();
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:true, type:"RemoveDescription", config:{} };
        this.general.SetConfigObj(cmdConfig);
        cmdConfig.isPublic=false;
        cmdConfig.isPublicAccount=false;
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        pageManager.gotopage(pageControlCenter);
    },
    GetURL:function(e)
    {
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetFeedUrl", key:this.key});
        if (!resultObj) return;
        $("RD_Feed_URL").set('href', resultObj.FeedURL);
        $("RD_InputURL").hide(function(){$("RD_FeedURL").show();});
    }

};


var pageLinks2Feed=
{
    _initialize_:function()
    {
        this.div=$("page_Links2Feeds");
        this.general=new pageGeneral(this);
        $("L2F_Btn_Update").addEvent('click',this.Update.bindWithEvent(this));
        $("L2F_Btn_GenerateFeed").addEvent('click',this.GenerateFeed.bindWithEvent(this));
        $("L2F_Btn_GetFeedURL").addEvent('click',this.GetURL.bindWithEvent(this));
        $$(".L2F_Error").setStyle('opacity',0);
        this.Unload();
        this.div.getElements("input").addEvent('change',(function(e){this.modified=true;}).bindWithEvent(this));
        //debug
        // $("L2F_Url").set('value','http://www.google.com');
        // $("L2F_Title").set('value','你好');
    },
    Load: function(theOldKey) 
    {
        this.Unload();
        this.isNew = (theOldKey === undefined);
        this.key=theOldKey;
        if (!this.isNew)
        {
            // load the config
            var theConfig=getResult("/ControlCenter/Control", {cmd:"GetConfig", "key":theOldKey});
            $("L2F_Url").value=theConfig.url;
            $("L2F_Cookie").value=theConfig.config.cookie;
            $("L2F_Title").value=theConfig.config.title;
            $("L2F_MainPattern").value=theConfig.config.MainPattern;
            $("L2F_LinkIncludePattern").value=theConfig.config.LinkInclude;
            $("L2F_LinkExcludePattern").value=theConfig.config.LinkExclude;
            $("L2F_DescIncludePattern").value=theConfig.config.DescInclude;
            $("L2F_DescExcludePattern").value=theConfig.config.DescExclude;

            if ( theConfig.config.UseLinkAsGUID != undefined )
            {
                $("L2F_Input_GUID_link").checked = theConfig.config.UseLinkAsGUID;
                $("L2F_Input_GUID_title").checked = !theConfig.config.UseLinkAsGUID;
            }
            else
                $("L2F_Input_GUID_link").checked = true;

            this.general.Load(theConfig);
            if (theConfig.readonly)
            {
                $$("#L2F_ControlPanel input").set("disabled",true);
                $$("#L2F_ControlPanel input[class=readonlyElement]").set("disabled",false);
                $$("#L2F_ControlPanel input[class=ReadonlyEnable]").set("disabled",false);
            }
        }
        this.modified=false;
    },
    Unload: function() 
    {
        $$("#page_Links2Feeds>div").setStyle("display","none");
        $("L2F_Input_GUID_link").checked = true;
        $("L2F_ControlPanel").setStyle("display","inline");
        $$("#page_Links2Feeds input[type=text]").set("value","");
        $("L2F_Result_Title").empty();
        $("L2F_ResultList").empty();
        $$("#L2F_ControlPanel input").set("disabled",false);
        this.general.Unload();
    },
    Update:function(e)
    {
        var theURL=$("L2F_Url").value.trim();
        if (theURL === "")
        {
            $("L2F_Error_EmptyURL").errorHint();
            return;
        }
        var preview=getResult("/ControlCenter/Control", {cmd:"GetLink2FeedPreview", url:theURL, config:this.GetConfig() });
        if (!preview) return;
        $("L2F_Result_Title").set('text',preview.title);
        $("L2F_ResultList").empty();
        preview.links.each((function(item)
        {
            var li=new Element("li", {html:item.desc+"<br><font color='blue'>"+item.link+'</font>'});
            $("L2F_ResultList").appendChild(li);
        }).bind(this));
    },
    GenerateFeed:function(e)
    {
        var theURL=$("L2F_Url").value.trim();
        if (theURL === "")
        {
            $("L2F_Error_EmptyURL").errorHint();
            return;
        }
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:this.isNew, type:"Links2Feed", config:this.GetConfig() };
        if (!this.isNew) cmdConfig.key=this.key;
        this.general.SetConfigObj(cmdConfig);
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        $("L2F_Feed_URL").set('href', resultObj.FeedURL);
        $("L2F_ControlPanel").hide(function(){$("L2F_FeedURL").show();});
        this.modified=false;
    },
    GetConfig:function()
    {
        return{
            // url:$("L2F_Url").value,
            // name:$(L2F_Input_ConfigName).value.trim(),
            cookie:$("L2F_Cookie").value.trim(),
            title:$("L2F_Title").value.trim(),
            MainPattern:$("L2F_MainPattern").value.trim(),
            LinkInclude:$("L2F_LinkIncludePattern").value.trim(),
            LinkExclude:$("L2F_LinkExcludePattern").value.trim(),
            DescInclude:$("L2F_DescIncludePattern").value.trim(),
            DescExclude:$("L2F_DescExcludePattern").value.trim(),
            UseLinkAsGUID:$("L2F_Input_GUID_link").checked
        };
    },
    clone:function()
    {
        var theURL=$("L2F_Url").value.trim();
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:true, type:"Links2Feed", config:this.GetConfig() };
        this.general.SetConfigObj(cmdConfig);
        cmdConfig.isPublic=false;
        cmdConfig.isPublicAccount=false;
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        pageManager.gotopage(pageControlCenter);
    },
    GetURL:function(e)
    {
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetFeedUrl", key:this.key});
        if (!resultObj) return;
        $("L2F_Feed_URL").set('href', resultObj.FeedURL);
        $("L2F_ControlPanel").hide(function(){$("L2F_FeedURL").show();});
    }


};

var pageFeedFilters=
{
    _initialize_:function()
    {
        this.div=$("page_FeedFilters");
        this.general=new pageGeneral(this);
        $("FF_Btn_Update").addEvent('click',this.Update.bindWithEvent(this));
        $("FF_Btn_GenerateFeed").addEvent('click',this.GenerateFeed.bindWithEvent(this));
        $("FF_Btn_GetFeedURL").addEvent('click',this.GetURL.bindWithEvent(this));
        $("FF_Btn_NewFilter").addEvent('click',this.AddNewFilter.bindWithEvent(this));
        $("FF_Btn_Save").addEvent('click',this.SaveConfiguration.bindWithEvent(this));
        $$(".FF_Error").setStyle('display','none');
        $$("#FF_ControlPanel input").addEvent('change',(function(e){this.modified=true;}).bindWithEvent(this));
        this.Unload();
    },
    Load: function(theOldKey) 
    {
        this.Unload();
        this.isNew = (theOldKey === undefined);
        this.key=theOldKey;
        if (!this.isNew)
        {
            // load the config
            var theConfig=getResult("/ControlCenter/Control", {cmd:"GetConfig", "key":theOldKey});
            $("FF_Url").value=theConfig.url;
            theConfig.config.filters.each((function(filter)
            {
                var li=this.AddNewFilter();
                li.getElement("[name=FF_text_Filter]").value =filter.FilterPattern;
                li.getElement("[name=Skip]").checked = filter.SkipBelow;
                li.getElement("[value="+filter.color+"]").checked = true;
            }).bind(this));
            this.general.Load(theConfig);
            if (theConfig.readonly)
            {
                $$("#FF_ControlPanel input").set("disabled",true);
                $$("#page_FeedFilters input[class=readonlyElement]").set("disabled",false);
                $$("#page_FeedFilters input[class=ReadonlyEnable]").set("disabled",false);
            }
        }
        this.modified=false;
    },
    Unload: function() 
    {
        $("FF_FilterList").empty();
        $("FF_ResultList").empty();
        $$("#page_FeedFilters input[type=text]").set("value","");
        $$("#FF_FeedDiv>input[type=checkbox]").set("checked",false);
        $("FF_Generate_title").value="";
        $("FF_Feed_URL_span").setStyle('display','none');
        $$("#page_FeedFilters input").set("disabled",false);
        this.FilterID=0;
        this.general.Unload();
    },
    AddNewFilter:function(e)
    {
        var li=$("FF_li_Filter_proto").getElement("li").clone();
        li.set('class', 'FF_li_Filter');
        li.getElement("input[name=up]").addEvent('click',this.moveFilter.bind(this,[-1,li]));
        li.getElement("input[name=down]").addEvent('click',this.moveFilter.bind(this,[1,li]));
        li.getElement("input[name=remove]").addEvent('click',this.removeFilter.bind(this,li));
        li.getElement("input[value=red]").set("name",String(this.FilterID));
        li.getElement("input[value=blue]").set("name",String(this.FilterID));
        li.getElement("input[value=green]").set("name",String(this.FilterID));
        li.getElements("input").addEvent('change',(function(){this.modified=true;}).bind(this));

        $("FF_FilterList").appendChild(li);
        ++this.FilterID;
        this.modified=true;
        return li;
    },
    moveFilter:function(direction, obj_li)
    {
        if (direction == -1)
        {
            var preLi=obj_li.getPrevious("li");
            if (preLi)
                obj_li.inject(preLi,'before');
        } else
        {
            var nextLi=obj_li.getNext("li");
            if (nextLi)
                obj_li.inject(nextLi,'after');
        }
        this.modified=true;
    },
    removeFilter:function(obj_li)
    {
        this.modified=true;
        obj_li.dispose();
    },
    GetConfig:function()
    {
        var filters=$$("#page_FeedFilters .FF_li_Filter");
        var filterList=[];
        filters.each((function(liObj)
        {
            filterList.push({
                FilterPattern:liObj.getElement("[name=FF_text_Filter]").value ,
                SkipBelow:liObj.getElement("[name=Skip]").checked,
                color:liObj.getElement("[value=red]").checked?"red":liObj.getElement("[value=blue]").checked?"blue":"green"
                });
        }).bind(this));
        return {"filters":filterList};
        // alert(JSON.encode(filterList));
    },
    SaveConfiguration:function(e)
    {
        var theURL=$("FF_Url").value.trim();
        if (theURL === "")
        {
            $("FF_Error_EmptyURL").errorHint();
            return false;
        }
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:this.isNew, type:"FeedFilters", config:this.GetConfig() };
        if (!this.isNew) cmdConfig.key=this.key;
        this.general.SetConfigObj(cmdConfig);
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        if (resultObj.result == "SaveConfig")
        {
            $("FF_Info_ConfigSaved").errorHint();
            this.isNew = false;
            this.key=resultObj.key;
        }
        this.modified=false;
        return resultObj;
    },
    Update:function(e)
    {
        var theURL=$("FF_Url").value.trim();
        if (theURL === "")
        {
            $("FF_Error_EmptyURL").errorHint();
            return;
        }
        var preview=getResult("/ControlCenter/Control", {cmd:"GetFeedFilterPreview", url:theURL, config:this.GetConfig() });
        // $("FF_Result_Title").set('text',preview.title);
        $("FF_ResultList").empty();
        preview.list.each((function(item)
        {
            var li=new Element("li", {html:"<font color='"+item.color+"'>"+item.title+'</font>'});
            $("FF_ResultList").appendChild(li);
        }).bind(this));
    },
    GenerateFeed:function(e)
    {
        colors=this.getColorsSetting();
        if (!colors) return;
        var saveresult = this.SaveConfiguration();
        if (saveresult === false) return;
        $("FF_Feed_URL").set('href', saveresult.FeedURL+"&color="+colors.join('+')+($("FF_Generate_title").value.trim()===""?"":"&title="+$("FF_Generate_title").value.trim()));
        ['red','green','blue','grey'].each(function(theColor) {$("FF_Feed_URL_"+theColor).setStyle('display',$("FF_Generate_"+theColor).checked?"inline":"none" ); });
        $("FF_Feed_URL_span").setStyle('display','inline');
    },
    clone:function()
    {
        var theURL=$("FF_Url").value.trim();
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:true, type:"FeedFilters", config:this.GetConfig() };
        this.general.SetConfigObj(cmdConfig);
        cmdConfig.isPublic=false;
        cmdConfig.isPublicAccount=false;
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (!resultObj) return;
        pageManager.gotopage(pageControlCenter);
    },
    GetURL:function(e)
    {
        colors=this.getColorsSetting();
        if (!colors) return;
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetFeedUrl", key:this.key});
        if (!resultObj) return;
        $("FF_Feed_URL").set('href', resultObj.FeedURL+"&color="+colors.join('+')+($("FF_Generate_title").value.trim()===""?"":"&title="+$("FF_Generate_title").value.trim()));
        ['red','green','blue','grey'].each(function(theColor) {$("FF_Feed_URL_"+theColor).setStyle('display',$("FF_Generate_"+theColor).checked?"inline":"none" ); });
        $("FF_Feed_URL_span").setStyle('display','inline');
    },
    getColorsSetting:function()
    {
        var colors=[];
        ['red','green','blue','grey'].each(function(theColor) { if ($("FF_Generate_"+theColor).checked) colors.push(theColor); });
        if (colors.length === 0)
        {
            $("FF_Error_NoColorChoosen").errorHint();
            return false;
        }
        return colors;
    }
};


var pageContentExtend=
{
    _initialize_:function()
    {
        this.div=$("page_ContentExtend");
        this.general=new pageGeneral(this);
        $("CE_Btn_Update").addEvent('click',this.Update.bindWithEvent(this));
        $("CE_Btn_GenerateFeed").addEvent('click',this.GenerateFeed.bindWithEvent(this));
        $("CE_Btn_GetFeedURL").addEvent('click',this.GetURL.bindWithEvent(this));
        $$(".CE_Error").setStyle('opacity',0);
        this.Unload();
        this.div.getElements("input").addEvent('change',(function(e){this.modified=true;}).bindWithEvent(this));
    },
    Load: function(theOldKey) 
    {
        this.Unload();
        this.isNew = (theOldKey === undefined);
        this.key=theOldKey;
        if (!this.isNew)
        {
            // load the config
            var theConfig=getResult("/ControlCenter/Control", {cmd:"GetConfig", "key":theOldKey});
            $("CE_Url").value=theConfig.url;
            $("CE_Pattern").value=theConfig.config.Pattern;
            this.general.Load(theConfig);
            if (theConfig.readonly)
            {
                $$("#CE_ControlPanel input").set("disabled",true);
                $$("#CE_ControlPanel input[class=readonlyElement]").set("disabled",false);
                $$("#CE_ControlPanel input[class=ReadonlyEnable]").set("disabled",false);
            }
        }
        this.modified=false;
    },
    Unload: function() 
    {
        $$("#page_ContentExtend>div").setStyle("display","none");
        $("CE_ControlPanel").setStyle("display","inline");
        $$("#page_ContentExtend input[type=text]").set("value","");
        $("CE_Result_HTML_List").empty();
        $("CE_Result_Feed_List").empty();
        $$("#CE_ControlPanel input").set("disabled",false);
        $("CE_Pattern").value="<body.*\/body>";

        this.general.Unload();
    },
    Update:function(e)
    {
        var theURL=$("CE_Url").value.trim();
        if (theURL === "")
        {
            $("CE_Error_EmptyURL").errorHint();
            return;
        }
        var preview=getResult("/ControlCenter/Control", {cmd:"GetContentExtendPreview", url:theURL, config:this.GetConfig(), previewNum:3  });
        $("CE_Result_HTML_List").empty();
        $("CE_Result_Feed_List").empty();
        preview.list.each((function(item)
        {
            var li=new Element("li", {text:item.htmlContent});
            $("CE_Result_HTML_List").appendChild(li);
            var li=new Element("li", {html:item.htmlContent});
            $("CE_Result_Feed_List").appendChild(li);
        }).bind(this));
    },
    GenerateFeed:function(e)
    {
        var theURL=$("CE_Url").value.trim();
        if (theURL === "")
        {
            $("CE_Error_EmptyURL").errorHint();
            return;
        }
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:this.isNew, type:"ContentExtend", config:this.GetConfig() };
        if (!this.isNew) cmdConfig.key=this.key;
        this.general.SetConfigObj(cmdConfig);
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (resultObj.error) {alert("Error: "+resultObj.error); return;}
        $("CE_Feed_URL").set('href', resultObj.FeedURL);
        $("CE_ControlPanel").hide(function(){$("CE_FeedURL").show();});
        this.modified=false;
    },
    GetConfig:function()
    {
        return{
            Pattern:$("CE_Pattern").value.trim()
        };
    },
    clone:function()
    {
        var theURL=$("CE_Url").value.trim();
        var cmdConfig={cmd:"SaveConfig", url:theURL, isNew:true, type:"ContentExtend", config:this.GetConfig() };
        this.general.SetConfigObj(cmdConfig);
        cmdConfig.isPublic=false;
        cmdConfig.isPublicAccount=false;
        var resultObj=getResult("/ControlCenter/Control", cmdConfig);
        if (resultObj.error) {alert("Error: "+resultObj.error); return;}
        pageManager.gotopage(pageControlCenter);
    },
    GetURL:function(e)
    {
        var resultObj=getResult("/ControlCenter/Control", {cmd:"GetFeedUrl", key:this.key});
        if (resultObj.error) {alert("Error: "+resultObj.error); return;}
        $("CE_Feed_URL").set('href', resultObj.FeedURL);
        $("CE_ControlPanel").hide(function(){$("CE_FeedURL").show();});
    }
};


function Init()
{
    pageManager = new pageManagerClass(pageLoading);
    pageManager.gotopage(pageControlCenter);
}
window.addEvent('domready', Init);
