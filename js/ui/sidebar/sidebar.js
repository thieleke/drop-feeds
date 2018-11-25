/*global ThemeManager FeedsTopMenu LocalStorageManager Timeout Dialogs BrowserManager ItemSorter SecurityFilters RenderOptions RenderItemLayout
FeedsContextMenu FeedsTreeView Listener ListenerProviders BookmarkManager FeedManager ItemsLayout TabManager FeedsNewFolderDialog FeedsFilterBar*/
'use strict';
class SideBar { /*exported SideBar*/
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    /*eslint-disable no-console*/
    console.log('Drop Feeds loading...');
    /*eslint-enable no-console*/
    this._contentTop = null;
  }

  async init_async() {
    await BrowserManager.instance.init_async();
    await BookmarkManager.instance.init_async();
    await RenderOptions.instance;
    await Timeout.instance.init_async();
    await ThemeManager.instance.init_async();
    await ItemSorter.instance.init_async();
    await SecurityFilters.instance.init_async();
    FeedManager.instance;
    TabManager.instance;

    await FeedsTopMenu.instance.init_async();
    await FeedsFilterBar.instance.init_async();
    await FeedsTreeView.instance.load_async();
    await ItemsLayout.instance.init_async();
    RenderItemLayout.instance;
    await FeedsNewFolderDialog.instance.init_async();
    
    document.getElementById('mainBoxTable').addEventListener('click', (e) => { FeedsContextMenu.instance.hide(e); });
    FeedsTreeView.instance.selectionBar.refresh();
    this._computeContentTop();
    Listener.instance.subscribe(ListenerProviders.localStorage, 'reloadPanelWindow', (v) => { this.reloadPanelWindow_sbscrb(v); }, false);
    Listener.instance.subscribe(ListenerProviders.message, 'openSubscribeDialog', (v) => { this.openSubscribeDialog_async(v); }, false);
    this._addListeners();
    setTimeout(() => { SideBar.instance.resize(); }, 20);
  }

  async reloadPanelWindow_sbscrb() {
    window.location.reload();
  }

  async openSubscribeDialog_async() {
    let tabInfo = await BrowserManager.getActiveTab_async();
    Dialogs.openSubscribeDialog_async(tabInfo.title, tabInfo.url);
  }

  _addListeners() {
    window.onresize = ((e) => { this._windowOnResize_event(e); });
    document.getElementById('feedsContentPanel').addEventListener('scroll', (e) => { this._contentOnScroll_event(e); });
  }

  async _contentOnScroll_event() {
    FeedsTreeView.instance.selectionBar.refresh();
  }

  async _windowOnResize_event() {
    this.resize();
  }

  _computeContentTop() {
    let refElementId = (FeedsFilterBar.instance.enabled ? 'filterBar' : 'statusBar');
    let refElement = document.getElementById(refElementId);
    let rect = refElement.getBoundingClientRect();
    this._contentTop = rect.bottom + 1;
  }

  resize() {
    FeedsTreeView.instance.resize();
    ItemsLayout.instance.resize();
    RenderItemLayout.instance.resize();
  }
}
SideBar.instance.init_async();
