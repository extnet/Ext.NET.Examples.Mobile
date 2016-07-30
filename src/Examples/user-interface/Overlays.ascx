﻿<%@ Control Language="C#" %>

<ext:Container runat="server" Padding="20" Scrollable="Both">
    <LayoutConfig>
        <ext:VBoxLayoutConfig Align="Stretch">
            <CustomConfig>
                <ext:ConfigItem Name="pack" Value="top" />
            </CustomConfig>
        </ext:VBoxLayoutConfig>
    </LayoutConfig>
    <Defaults>
        <ext:Parameter Name="cls" Value="demobtn" />
        <ext:Parameter Name="margin" Value="10 0" />
    </Defaults>
    <Items>
        <ext:Button runat="server" Text="Action Sheet" Handler="
                var items = [
                    {
                    text: 'Delete draft',
                    ui: 'decline',
                    scope: this,
                    handler: function() {
                        this.actions.hide();
                    }
                },
                {
                    text: 'Save draft',
                    scope: this,
                    handler: function() {
                        this.actions.hide();
                    }
                },
                {
                    xtype: 'button',
                    text: 'Cancel',
                    scope: this,
                    handler: function() {
                        this.actions.hide();
                    }
                }
            ];

            if (!this.actions) {
                this.actions = Ext.create('Ext.ActionSheet', {
                    items: items
                });
            }

            Ext.Viewport.add(this.actions);
            this.actions.show();" />

        <ext:Button
            runat="server"
            Text="Overlay"
            Handler="
            if (!this.overlay) {
                this.overlay = Ext.Viewport.add({
                    xtype: 'panel',
                    modal: true,
                    hideOnMaskTap: true,
                    showAnimation: {
                        type: 'popIn',
                        duration: 250,
                        easing: 'ease-out'
                    },
                    hideAnimation: {
                        type: 'popOut',
                        duration: 250,
                        easing: 'ease-out'
                    },
                    centered: true,
                    width: Ext.filterPlatform('ie10') ? '100%' : (Ext.os.deviceType == 'Phone') ? 260 : 400,
                    height: Ext.filterPlatform('ie10') ? '30%' : Ext.os.deviceType == 'Phone' ? 220 : 400,
                    styleHtmlContent: true,
                    html: '&lt;p&gt;This is a modal, centered and floating panel. hideOnMaskTap is true by default so ' +
                        'we can tap anywhere outside the overlay to hide it.&lt;/p&gt;',
                    items: [
                        {
                            docked: 'top',
                            xtype: 'toolbar',
                            title: 'Overlay Title'
                        }
                    ],
                    scrollable: true,
                    padding: 10
                });
            }

            this.overlay.show();" />
        <ext:Button
            runat="server"
            Text="Alert"
            Handler="Ext.Msg.alert('Title', 'The quick brown fox jumped over the lazy dog.', Ext.emptyFn);" />
        <ext:Button
            runat="server"
            Text="Prompt"
            Handler="Ext.Msg.prompt('Welcome!', 'What\'s your first name?', Ext.emptyFn);" />
        <ext:Button
            runat="server"
            Text="Confirm"
            Handler="Ext.Msg.confirm('Confirmation', 'Are you sure you want to do that?', Ext.emptyFn);" />
        <ext:Button runat="server" Text="Picker" Handler="
            if (!this.picker) {
                this.picker = Ext.Viewport.add({
                    xtype: 'picker',
                    slots: [
                        {
                            name : 'limit_speed',
                            title: 'Speed',
                            data : [
                                {text: '50 KB/s', value: 50},
                                {text: '100 KB/s', value: 100},
                                {text: '200 KB/s', value: 200},
                                {text: '300 KB/s', value: 300}
                            ]
                        }
                    ]
                });
            }

            this.picker.show();" />
    </Items>
</ext:Container>