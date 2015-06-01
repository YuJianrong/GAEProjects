/*
 * Copyright 2010 Yu Jianrong, All Rights Reserved
 * 
 * Licensed under BSD License.
 */

var pageManagerClass= new Class(
{
    initialize: function(firstPage)
    {
        this.CurrentPage = firstPage;
        if (!firstPage.initialized) {firstPage._initialize_(); firstPage.initialized=true;}
    },
    gotopage: function(thePage)
    {
        if (!thePage.initialized) {thePage._initialize_(); thePage.initialized=true;}
        var newArgu = $A(arguments);
        newArgu.shift();
        this.CurrentPage.div.hide((function(){this.CurrentPage.Unload();this.CurrentPage=thePage;this.CurrentPage.Load.apply(this.CurrentPage,newArgu);this.CurrentPage.div.show();}).bind(this));
    }
});


function getResult(url, requestObj)
{
    var resultObj=false;
    var theRequest = new Request({
        "url": url,
        method: 'post', 
        data: JSON.encode(requestObj),
        async: false,
        onSuccess:function(responseText, responseXML) { 
            resultObj=JSON.decode(responseText);
            if (resultObj.error)
            {
                $("span_GeneralError").empty();
                $("span_GeneralError").set('text', resultObj.error+":"+resultObj.message);
                if (window.location.search.search("ftb_debug")!= -1 ) 
                {
                    // $("span_GeneralError").appendText(resultObj.callstack);
                    $("span_GeneralError").appendChild(new Element("pre",{style:"color:red;background-color:white", text:resultObj.callstack}));
                    $("span_GeneralError").show();
                }
                else
                    $("span_GeneralError").errorHint(5000);
                resultObj = false;
            }
        },
        onFailure:function(xhr) { 
            if (window.location.search.search("ftb_debug")!= -1 ) 
                $$("body")[0].appendChild(new Element("div",{html:"status: "+xhr.status+" "+xhr.statusText+"<br>"+xhr.responseText}));
        }
        });
    theRequest.send();
    return resultObj;
}

// Enhance the element effects
Element.implement({
    show:function(callback)
    {
        // this.setStyle('opacity',0);
        // this.setStyle('display','inline');
        // var fx = new Fx.Tween(this);
        // fx.addEvent('complete', function(e){ if (callback) callback();});
        // fx.start('opacity',[0,1]);

        this.setStyle('display','inline');
        this.setStyle('opacity',1);
        if (callback) callback();
    },
    hide:function(callback)
    {
        // var fx = new Fx.Tween(this);
        // fx.addEvent('complete', function(e){e.setStyle('display','none'); e.setStyle('opacity',1); if (callback) callback();});
        // fx.start('opacity',[1,0]);

        this.setStyle('display','none');
        this.setStyle('opacity',1);
        if (callback) callback();
    },
    errorHint:function(lastTime)
    {
        this.show((function(){this.hide.delay(lastTime?lastTime:2000,this);}).bind(this));
    }
});
