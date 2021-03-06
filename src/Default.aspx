﻿<%@ Page Language="C#" %>

<script runat="server">
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!X.IsAjaxRequest)
        {
            // Preloading for smoother loading of Charts and Draw components
            ResourceManager.RegisterControlResources<DrawContainer>();
        }
    }

    [DirectMethod]
    public string GetView(string viewName)
    {
        var path = @"~\Examples\";

        viewName = viewName.Remove(0, "KitchenSink.view.".Length);
        viewName = viewName.Replace(".", @"\");
        path = String.Concat(path, viewName, ".ascx");

        return ComponentLoader.ToConfig(path);
    }

    [DirectMethod]
    public string GetServerSideFileContents(string file)
    {
        return Ext.Net.Examples.Mobile.Class.GetFileContents.JsAndHTMLFriendly(file);
    }
</script>

<!DOCTYPE html>

<html>
<head runat="server">
    <title>Ext.NET Mobile Examples</title>

    <link rel="stylesheet" type="text/css" href="/resources/css/KitchenSink-all.css?v=4.1.0.0" />
    <link rel="stylesheet" type="text/css" href="/resources/css/main.css?v=4.1.0.0" />

    <script src="resources/js/classes/StoreDemos.js?v=4.1.0.8"></script>
    <script src="resources/js/classes/SourceOverlay.js?v=4.1.0.3"></script>

    <script src="resources/js/main.js?v=4.1.0.0"></script>

    <script>
        Ext.dataview.NestedList.override({
            doBack: function (me, node, lastActiveList, detailCardActive) {
                var layout = me.getLayout(),
                    animation = layout ? layout.getAnimation() : null;

                if (detailCardActive && lastActiveList) {
                    if (animation) {
                        animation.setReverse(true);
                    }

                    me.goToNode(node.parentNode); // This replaces the commented out code below

                    // This doesn't work as expected causing wrong navigation
                    // if a sample is opened via a direct link
                    // me.setActiveItem(lastActiveList);
                    // me.setLastNode(node.parentNode);
                    // me.syncToolbar();
                } else {
                    me.goToNode(node.parentNode);
                }
            }
        });
    </script>
</head>
<body>
    <ext:ResourceManager runat="server" />

    <ext:Menu
        ID="LinksMenu"
        runat="server"
        Side="Right"
        Scrollable="Vertical"
        Cls="sidebar-menu"
        WidthSpec="75%">
        <Items>
            <ext:Component runat="server" Html="<a href='https://mobile.ext.net/'>Mobile Examples</a>" />
            <ext:Component runat="server" Html="<a href='https://mvc.mobile.ext.net/'>MVC Mobile Examples</a>" />
            <ext:Component runat="server" Html="<div class='separator'></div>" />
            <ext:Component runat="server" Html="<a href='https://docs.sencha.com/extjs/6.6.0'>EXT JS Documentation</a>" />
            <ext:Component runat="server" Html="<a href='https://docs.ext.net/'>Ext.NET Documentation</a>" />
            <ext:Component runat="server" Html="<div class='separator'></div>" />
            <ext:Component runat="server" Html="<a href='https://forums.ext.net/'>Community Forums</a>" />
            <ext:Component runat="server" Html="<a href='https://ext.net/faq/'>FAQ</a>" />
            <ext:Component runat="server" Html="<a href='https://ext.net/contact/'>Contact</a>" />
            <ext:Component runat="server" Html="<a href='https://ext.net'>Ext.NET Home</a>" />
            <ext:Button runat="server" Text="Get Ext.NET" UI="Action">
                <Listeners>
                    <Tap Handler="window.location='https://ext.net/store';" />
                </Listeners>
            </ext:Button>
        </Items>
    </ext:Menu>

    <ext:NestedList
        ID="MainNestedList"
        runat="server"
        UseTitleAsBackText="false"
        StoreID="Demos"
        Title="Ext.NET Mobile"
        TemplateWidget="true">
        <Toolbar
            ID="MainNavigationBar"
            runat="server"
            Cls="main-navigation-bar"
            Docked="Top">
            <Items>
                <ext:Button
                    ID="ViewSourceButton"
                    runat="server"
                    Hidden="true"
                    Align="Right"
                    UI="Action"
                    Text="Source" 
                    />

                <ext:Button
                    ID="MenuButton"
                    runat="server"
                    Align="Right"
                    IconCls="x-fa fa-navicon"
                    MarginSpec="0 0 0 5" 
                    />
            </Items>
        </Toolbar>
    </ext:NestedList>
</body>
</html>
