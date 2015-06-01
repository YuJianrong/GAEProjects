
var g_Pages = {};
var g_CurrentPage = "";

var g_CurrentProject="";

function gotopage(thePage)
{
    for (var page in g_Pages)
    {
        if (page === thePage)
        {

            // unload the old page
            if (g_Pages[g_CurrentPage]["Unload"] !== undefined)
                (g_Pages[g_CurrentPage]["Unload"])();
            // document.getElementById(g_Pages[g_CurrentPage].pageID).style.display='none';
            $("#"+g_Pages[g_CurrentPage].pageID).hide("normal", function(){
                                                      // load the new page
                                                      if (g_Pages[g_CurrentPage]["Load"] !== undefined)
                                                          (g_Pages[g_CurrentPage]["Load"])();
                                                      $("#"+g_Pages[g_CurrentPage].pageID).show("normal");
                                                      });
            g_CurrentPage=thePage;
            // document.getElementById(g_Pages[thePage].pageID).style.display='inline';
            // $("#"+g_Pages[thePage].pageID).show("slow");
            break;
        }
    }
}


function errorHandler(status, statusText, responseText)
{
    // document.innerHTML=responseText;
    var newdiv = document.createElement("div");
    newdiv.innerHTML = responseText;
    //var container = document.getElementById("container");
    document.body.appendChild(newdiv);
}

function Init()
{
    g_Pages["page_Loading"]         ={"pageID":"page_Loading"};
    g_Pages["page_Admin"]  ={"pageID":"page_Admin", "Load":Init_Admin, "Unload":Uninit_Admin};

    g_CurrentPage = "page_Loading";
    gotopage("page_Admin");

    var xmlCmd = BuildCommand("GetIPUpdate");
    var result = HTTP.post_Sync("Admin.py", XML.serialize(xmlCmd), errorHandler);

    $("#IpInfo")[0].innerHTML = "<XMP>" + XML.serialize(result) + "</XMP>";
}

function BuildCommand(cmd)
{
    var xmlDoc = new XML.newDocument("Command");
    var xmlRoot = xmlDoc.documentElement;
    xmlRoot.setAttribute("cmd",cmd);

    return xmlDoc;
}



function getFromDb(dataType)
{
    var xmlCmd = BuildCommand("Get"+dataType+"s");
    var result = HTTP.post_Sync("Admin.py", XML.serialize(xmlCmd), errorHandler);
    var nodes = result.documentElement.getElementsByTagName(dataType);
    var retArray = [];
    for (var i=0; i<nodes.length; ++i)
        retArray.push( nodes[i].getAttribute("Value"));
    return retArray;
}



var UrlInHtml={};
// ****************
// User Management
// ****************
//
// Cmd: <Command cmd="GetUsers"></Command>
// Result: <Result status="OK"><User Name="A"/><User Name="B"/></Result>
function Init_Admin()
{
    var urls = getFromDb("Url");
    // add users to list
    var div=$("#Lst_URLs")[0];
    for (var i=0; i<urls.length; ++i)
    {
        var li = document.createElement("li");
        li.innerHTML=urls[i]+'<input type="button" name="Btn_' +i + '" value="Remove" onclick="RemoveURL(\'' + i + '\')">';
        UrlInHtml[i] = urls[i];
        div.appendChild(li);
    }
}

function Uninit_Admin()
{
    // clear the list
    $("#Lst_URLs")[0].innerHTML="";
}

//
// Cmd: <Command cmd="AddUser"><User Name="A"><User Name="B"></Command>
// Result: <Result status="OK"><Info AddedUsers="10"/></Result>
function AddURLs(UrlList)
{
    var xmlCmd = BuildCommand("AddUrl");
    var Array_Urls=UrlList.split("\n");
    // var div=document.getElementById("Lst_UrlManagement_UrlList");
    for (var i=0 ; i<Array_Urls.length; ++i)
    {
        var url=$.trim(Array_Urls[i])
        if ( url!== "")
        {
            var UrlNode = xmlCmd.createElement("Url");
            UrlNode.setAttribute("Value" , url);
            xmlCmd.documentElement.appendChild(UrlNode);
        }
    }
    var result = HTTP.post_Sync("Admin.py", XML.serialize(xmlCmd), errorHandler);
    $("#Txt_NewURL")[0].value="";
    Uninit_Admin();
    Init_Admin();
}

// Cmd:: <Command cmd="RemoveUrl" UrlValue="http://wedwedwed">
// Result: <Result status="OK"><Info AddedUsers="10"/></Result>
function RemoveURL(index)
{
    Url = UrlInHtml[index];
    var xmlCmd = BuildCommand("RemoveUrl");
    xmlCmd.documentElement.setAttribute("UrlValue" , Url);
    var result = HTTP.post_Sync("Admin.py", XML.serialize(xmlCmd), errorHandler);
    Uninit_Admin();
    Init_Admin();
}

