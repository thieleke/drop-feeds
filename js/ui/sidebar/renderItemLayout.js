/*global SplitterBar BrowserManager Listener ListenerProviders SideBar DefaultValues ItemsLayout TextTools FeedRenderer*/
'use strict';
class RenderItemLayout { /*exported RenderItemLayout */
  static get instance() { return (this._instance = this._instance || new this()); }

  constructor() {
    this._feedItemRenderInSidebarEnabled = DefaultValues.feedItemRenderInSidebar;
    this._visible = (ItemsLayout.instance.visible && this._feedItemRenderInSidebarEnabled);
    this._splitterBar2 = new SplitterBar('splitterBar2');
    this._renderLayoutCell = document.getElementById('renderLayoutCell');
    this._renderItemText = document.getElementById('renderItemText');
    Listener.instance.subscribe(ListenerProviders.localStorage, 'feedItemRenderInSidebar', (v) => { this._renderItemLayoutEnabled_async(v); }, true);
    Listener.instance.subscribe(ListenerProviders.localStorage, 'itemsContentHeightRenderOpened', (v) => { this._itemsContentHeightRenderOpened_async(v); }, true);
  }

  get top() {
    let top = window.innerHeight;
    if (this._visible) {
      top = this._splitterBar2.top;
    }
    return top;
  }

  get visible() {
    return this._visible;
  }

  get splitterBar2() {
    return this._splitterBar2;
  }

  clear() {
    this._renderItemText.textContent = '';
    BrowserManager.setInnerHtmlById('renderTitle', '');
  }

  resize() {
    let rec = this._renderItemText.getBoundingClientRect();
    let height = Math.max(window.innerHeight - rec.top, 0);
    BrowserManager.setElementHeight(this._renderItemText, height);
    document.getElementById('renderTitleBar').style.width  = window.innerWidth + 'px';
    this._renderItemText.style.width = window.innerWidth + 'px';
  }

  setVisibility() {
    let prevVisible = this._visible;
    this._visible = (ItemsLayout.instance.visible && this._feedItemRenderInSidebarEnabled);
    this._splitterBar2.visible = this._visible;
    this._renderLayoutCell.style.display = this._visible ? 'table-cell' : 'none';
    if (!prevVisible && this._visible) {
      ItemsLayout.instance.setContentHeight(this._itemsContentHeightRenderOpened);
    }
    SideBar.instance.resize();
    setTimeout(() => { SideBar.instance.resize(); }, 20);    
  }

  displayItem(item) {
    this._setTitle(item.title, item.link);
    let itemText = TextTools.toPlainText(item.description);    
    this._renderItemText.textContent = itemText;
  }

  _setTitle(title, titleLink) {
    let titleHtml = FeedRenderer.renderItemsTitleToHtml(title, titleLink);
    BrowserManager.setInnerHtmlById('renderTitle', titleHtml);
  }

  _renderItemLayoutEnabled_async(value) {
    this._feedItemRenderInSidebarEnabled = value;
    this.setVisibility();
  }

  _itemsContentHeightRenderOpened_async(value) {
    this._itemsContentHeightRenderOpened = value;
  }
}