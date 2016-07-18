﻿/**
 * @class KitchenSink.controller.Main
 * @extends Ext.app.Controller
 *
 * This is an abstract base class that is extended by both the phone and tablet versions. This controller is
 * never directly instantiated, it just provides a set of common functionality that the phone and tablet
 * subclasses both extend.
 */
Ext.define('KitchenSink.controller.Main', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.Deferred'
    ],

    namespaces: "KitchenSink",

    config: {
        /**
         * @private
         */
        viewCache: [],

        refs: {
            nav: '#MainNestedList',
            main: 'mainview',
            toolbar: '#MainNavigationBar',
            sourceButton: '#ViewSourceButton',
            themeToggleButton: 'button[action=toggleTheme]',


            sourceOverlay: {
                selector: 'sourceoverlay',
                xtype: 'sourceoverlay',
                autoCreate: true
            }
        },

        control: {
            sourceButton: {
                tap: 'onSourceTap'
            },
            themeToggleButton: {
                tap: 'onThemeToggleTap'
            },
            nav: {
                itemtap: 'onNavTap',
                leafitemtap: 'onNavLeafTap'

            }
        },

        routes: {
            'demo/:id': 'showViewById',
            'menu/:id': 'showMenuById',
            '': 'showMenuById'
        },

        /**
         * @cfg {Ext.data.Model} currentDemo The Demo that is currently loaded. This is set whenever showViewById
         * is called and used by functions like onSourceTap to fetch the source code for the current demo.
         */
        currentDemo: undefined
    },

    /**
     * Finds a given view by ID and shows it. End-point of the "demo/:id" route
     */
    showViewById: function (id) {
        var nav = this.getNav(),
            view = nav.getStore().getNodeById(id);

        this.showView(view);
        this.hideSheets();
    },

    isProfile: function (item) {
        var profileName = item.get('profileName'),
            ret = false;

        if (profileName !== undefined) {
            window.location = profileName ? (location.pathname + '?profile=' + profileName) : '';
            ret = true;
        }

        return ret;
    },

    /**
     * Shows the source code for the {@link #currentDemo} in an overlay
     */
    onSourceTap: function () {
        var me = this,
            overlay = this.getSourceOverlay(),
            demo = this.getCurrentDemo(),
            cls, files, content;

        if (demo) {
            if (!overlay.getParent()) {
                Ext.Viewport.add(overlay);
            }

            overlay.show();

            if (demo.$cachedContent) {
                me.setOverlayContent(overlay, demo.$cachedContent);
            } else {
                overlay.setMasked({
                    xtype: 'loadmask',
                    message: 'Loading Source'
                });

                cls = demo.viewName;
                cls = cls.substr("KitchenSink.view.".length);
                cls = cls.replace(/\./g, '/');

                files = [this.getFileContent({
                    type: 'Markup',
                    path: "Examples/" + cls + '.ascx'
                })];

                content = this.getNav().getLastNode().data.otherContent;

                if (content) {
                    if (!Ext.isArray(content)) {
                        content = [content];
                    }

                    content.forEach(function (content) {
                        files.push(this.getFileContent(Ext.apply({}, content)));
                    }, this);
                }

                Ext.Deferred.all(files).then(function (values) {
                    values.forEach(function (item) {
                        item.title = item.type;
                        delete item.type;
                    });

                    me.setOverlayContent(overlay, values);
                    overlay.unmask();
                    
                    demo.$cachedContent = values;
                });
            }
        }
    },

    setOverlayContent: function (overlay, items) {
        overlay.removeAll();
        overlay.add(items);
        overlay.getTabBar().setHidden(items.length === 1);
    },

    getFileContent: function (options) {
        return Ext.Ajax.request({
            url: options.path
        }).then(function (response) {
            return {
                type: options.type,
                html: response.responseText
            };
        }, function () {
            return null;
        });
    },

    onThemeToggleTap: function () {
        if (Ext.theme.name === 'Tizen') {
            if (!KitchenSink.app.getThemeVariationTransitionCls()) {
                KitchenSink.app.setThemeVariationTransitionCls("tizenThemeTransition");
            }

            if (KitchenSink.app.getThemeVariation() === "light") {
                KitchenSink.app.setThemeVariation("dark");
            } else {
                KitchenSink.app.setThemeVariation("light");
            }
        }

    },

    /**
     * @private
     * In the kitchen sink we have a large number of dynamic views. If we were to keep all of them rendered
     * we'd risk causing the browser to run out of memory, especially on older devices. If we destroy them as
     * soon as we're done with them, the app can appear sluggish. Instead, we keep a small number of rendered
     * views in a viewCache so that we can easily reuse recently used views while destroying those we haven't
     * used in a while.
     * @param {String} name The full class name of the view to create (e.g. "KitchenSink.view.Forms")
     * @return {Ext.Component} The component, which may be from the cache
     */
    createView: function (item, callback) {
        var name = this.getViewName(item),
            cache = this.getViewCache(),
            ln = cache.length,
            limit = item.get('limit') || 20,
            view, i = 0, j, oldView;

        for (; i < ln; i++) {
            view = cache[i];
            if (view.viewName === name) {
                this.activeView = view;
                callback.call(this, view, false);

                return;
            }
        }

        if (ln >= limit) {
            for (i = 0, j = 0; i < ln; i++) {
                oldView = cache[i];
                if (!oldView.isPainted()) {
                    oldView.destroy();
                } else {
                    cache[j++] = oldView;
                }
            }
            cache.length = j;
        }

        // NestedList should not go to leaf node until the example is loaded
        var nav = this.getNav(),
            originalGoToLeaf = nav.goToLeaf;

        nav.goToLeaf = Ext.emptyFn;

        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: 'Loading '
        });

        App.direct.GetView(name, {
            success: function (response) {
                response = Ext.decode(response);

                Ext.net.loadResources(response, function (config) {
                    view = Ext.create(config[0]);
                    view.viewName = name;
                    cache.push(view);
                    this.setViewCache(cache);
                    this.activeView = view;
                    nav.goToLeaf = originalGoToLeaf;
                    callback.call(this, view, true);
                }, this);
            },
            complete: function () {
                Ext.Viewport.setMasked(false);
            },
            scope: this
        });
    },

    /**
     * @private
     * In the kitchen sink we have a large number of dynamic views. If we were to keep all of them rendered
     * we'd risk causing the browser to run out of memory, especially on older devices. If we destroy them as
     * soon as we're done with them, the app can appear sluggish. Instead, we keep a small number of rendered
     * views in a viewCache so that we can easily reuse recently used views while destroying those we haven't
     * used in a while.
     * @param {String} name The full class name of the view to create (e.g. "KitchenSink.view.Forms")
     * @return {Ext.Component} The component, which may be from the cache
     */
    // That is the original ExtJS createView
    //createView: function (item) {
    //    var name = this.getViewName(item),
    //        cache = this.getViewCache(),
    //        ln = cache.length,
    //        limit = item.get('limit') || 20,
    //        view, i = 0, j, oldView;

    //    for (; i < ln; i++) {
    //        view = cache[i];
    //        if (view.viewName === name) {
    //            this.activeView = view;
    //            return view;
    //        }
    //    }

    //    if (ln >= limit) {
    //        for (i = 0, j = 0; i < ln; i++) {
    //            oldView = cache[i];
    //            if (!oldView.isPainted()) {
    //                oldView.destroy();
    //            } else {
    //                cache[j++] = oldView;
    //            }
    //        }
    //        cache.length = j;
    //    }

    //    view = Ext.create(name);
    //    view.viewName = name;
    //    cache.push(view);
    //    this.setViewCache(cache);

    //    this.activeView = view;

    //    return view;
    //},

    /**
     * @private
     * Returns the full class name of the view to construct for a given Demo
     * @param {KitchenSink.model.Demo} item The demo
     * @return {String} The full class name of the view
     */
    getViewName: function (item) {
        var name = item.get('view') || item.get('text'),
            ns = 'KitchenSink.view.';

        if (name == 'TouchEvents') {
            if (this.getApplication().getCurrentProfile().getName() === 'Tablet') {
                return ns + 'tablet.' + name;
            } else {
                return ns + 'phone.' + name;
            }
        } else {
            return ns + name;
        }
    },

    /**
     * we iterate over all of the floating sheet components and make sure they're hidden when we
     * navigate to a new view. This stops things like Picker overlays staying visible when you hit
     * the browser's back button
     */
    hideSheets: function () {
        Ext.each(Ext.ComponentQuery.query('sheet, #editorPanel'), function (sheet) {
            if (sheet instanceof Ext.Menu) {
                Ext.Viewport.hideMenu(sheet);
            } else {
                sheet.setHidden(true);
            }
        });
    }
});
