/*global browser BrowserManager FeedParser DefaultValues USTools ItemSorter ThemeManager FeedTransform TextTools FeedRendererOptions*/
'use strict';
class FeedRenderer { /*exported FeedRenderer*/

  static async renderFeedToHtml_async(feedText, defaultTitle, isError, subscribeButtonTarget) {
    let feedInfo = await FeedParser.getFeedInfo_async(feedText, defaultTitle, isError);
    //let feedHtml = await FeedRenderer._feedInfoToHtml_async(feedInfo);
    let feedHtml = await FeedTransform.transformFeedToHtml_async(feedInfo, subscribeButtonTarget);
    return feedHtml;
  }

  static feedErrorToHtml(error, url, title) {
    error = TextTools.replaceAll(error, '\n', '<br/>');
    let safeTitle = TextTools.escapeHtml(title);
    let safeUrl = TextTools.sanitizeUrl(url);
    let safeUrlDisplay = TextTools.escapeHtml(url);
    let safeError = TextTools.escapeHtml(error);
    let feedHtml = USTools.rssHeader(safeTitle, safeUrl, 'Error');
    let description = `<table>
    <tr><td>Name: </td><td>` + safeTitle + `</td></tr>
    <tr><td>Url: </td><td><a href="` + safeUrl + '">' + safeUrlDisplay + `</a></td></tr>
    <tr><td></td><td></td></tr>
    <tr><td>Error: </td><td>` + safeError + `</td></tr>
    </table>`;
    feedHtml += USTools.rssItem('Error: ' + TextTools.escapeHtml(error.split('<br/>')[0]), safeUrl, new Date(), description);
    feedHtml += USTools.rssFooter();
    return feedHtml;
  }

  static renderItemsTitleToHtml(title, link) {
    let titleHtml = '<a href="' + TextTools.sanitizeUrl(link) + '">' + TextTools.escapeHtml(title) + '</a>';
    return titleHtml;
  }

  static async renderItemListToHtml_async(itemList, tooltipsVisible) {
    let htmlItemList = [];
    if (itemList) {
      itemList = ItemSorter.instance.sort(itemList);
      for (let i = 0; i < itemList.length; i++) {
        let htmlItem = await FeedRenderer._getHtmlItemLine_async(itemList[i], i + 1, tooltipsVisible);
        htmlItemList.push(htmlItem);
      }
    }
    let itemsHtml = htmlItemList.join('\n');
    return itemsHtml;

  }

  static async feedItemsListToUnifiedHtml_async(feedItems, unifiedChannelTitle) {
    let feedInfo = DefaultValues.getDefaultFeedInfo();
    feedInfo.channel.title = unifiedChannelTitle;
    feedInfo.channel.description = 'Unified Feed';
    feedInfo.itemList = feedItems;
    let feedHtml = await FeedTransform.transformFeedToHtml_async(feedInfo);
    return feedHtml;
  }

  //private stuffs
  static async _feedInfoToHtml_async(feedInfo) {
    let htmlHead = await FeedRenderer._getHtmlHead_async(feedInfo.channel);
    let feedHtml = '';
    feedHtml += htmlHead;
    feedHtml += FeedRenderer._getHtmlChannel(feedInfo.channel, feedInfo.isError);
    let htmlItemList = [];
    feedInfo.itemList = ItemSorter.instance.sort(feedInfo.itemList);
    for (let i = 0; i < feedInfo.itemList.length; i++) {
      let htmlItem = FeedRenderer._getHtmlItem(feedInfo.itemList[i], i + 1, feedInfo.isError);
      htmlItemList.push(htmlItem);
    }
    feedHtml += htmlItemList.join('\n');
    feedHtml += FeedRenderer._getHtmFoot();
    return feedHtml;
  }

  static async _getHtmlHead_async(channel) {
    let iconUrl = browser.runtime.getURL(ThemeManager.instance.iconDF32Url);
    let cssUrl1 = browser.runtime.getURL(await ThemeManager.instance.getRenderCssTemplateUrl_async());
    let cssUrl2 = BrowserManager.getRuntimeUrl(await ThemeManager.instance.getRenderCssUrl_async());

    let encoding = 'utf-8'; // Conversion is now done in downloadTextFileEx_async()
    let htmlHead = '';
    htmlHead += '<html>\n';
    htmlHead += '  <head>\n';
    htmlHead += '    <meta http-equiv="Content-Type" content="text/html; charset=' + encoding + '">\n';
    htmlHead += '    <link rel="icon" type="image/png" href="' + iconUrl + '">\n';
    htmlHead += '    <link rel="stylesheet" type="text/css" href="' + cssUrl1 + '">\n';
    htmlHead += '    <link rel="stylesheet" type="text/css" href="' + cssUrl2 + '">\n';
    if (channel.title) { htmlHead += '    <title>' + TextTools.escapeHtml(channel.title) + ' - Drop-Feed</title>\n'; }
    htmlHead += '  </head>\n';
    htmlHead += '  <body>\n';
    return htmlHead;
  }

  static _getHtmFoot() {
    let htmlFoot = '';
    htmlFoot += '  </body>\n';
    htmlFoot += '</html>\n';
    return htmlFoot;
  }

  static _getHtmlChannel(channel, isError) {
    let htmlChannel = '';
    let title = channel.title;
    if (!title) { title = '(No Title)'; }
    let error = (isError ? 'error' : '');
    htmlChannel += '    <div class="channelHead ' + error + '">\n';
    if (channel.title) { htmlChannel += '      <h1 class="channelTitle"><a class="channelLink" href="' + TextTools.sanitizeUrl(channel.link) + '">' + TextTools.escapeHtml(channel.title) + '</a></h1>\n'; }
    if (channel.description) { htmlChannel += '      <p class="channelDescription">' + TextTools.escapeHtml(channel.description) + '</p>\n'; } else { htmlChannel += '<p class="channelDescription"/>'; }
    htmlChannel += '    </div>\n';
    return htmlChannel;
  }

  static _getEnclosureHTML(item) {
    if (!item || !item.enclosure)
      return '';
    let safeEncUrl = TextTools.sanitizeUrl(item.enclosure.url);
    let safeEncUrlDisplay = TextTools.escapeHtml(item.enclosure.url);
    let safeMimetype = TextTools.escapeHtml(item.enclosure.mimetype);
    if (item.enclosure.mimetype.startsWith('audio/')) {
      let html = '<div class="itemAudioPlayer"><audio preload=none controls><source src="' + safeEncUrl + '" type="' + safeMimetype + '"></audio></div>\n' +
        '<div class="itemEnclosureLink"><a href="' + safeEncUrl + '" download>' + safeEncUrlDisplay + '</a></div>\n';
      return html;
    }

    if (item.enclosure.mimetype.startsWith('video/')) {
      let html = '<div class="itemVideoPlayer"><video width=640 height=480 preload=none controls><source src="' + safeEncUrl + '" type="' + safeMimetype + '"></video></div>\n' +
        '<div class="itemEnclosureLink"><a href="' + safeEncUrl + '" download>' + safeEncUrlDisplay + '</a></div>\n';
      return html;
    }

    return '';
  }

  static _getHtmlItem(item, itemNumber, isError) {
    let htmlItem = '';
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    let error = (isError ? 'error' : '');
    htmlItem += '    <div class="item">\n';
    htmlItem += '      <h2 class="itemTitle ' + error + '">\n';
    htmlItem += '        <span class="itemNumber">' + (itemNumber ? itemNumber : item.number) + '.</span>\n';
    let linkTarget = FeedRendererOptions.instance.itemNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
    htmlItem += '        <a ' + linkTarget + ' href="' + TextTools.sanitizeUrl(item.link) + '">' + TextTools.escapeHtml(title) + '</a>\n';
    htmlItem += '      </h2>\n';
    if (item.description) { htmlItem += '      <div class="itemDescription">' + TextTools.escapeHtml(item.description) + ' </div>\n'; }
    htmlItem += '      <div class="itemInfo">\n';
    if (item.category) { htmlItem += '        <div class="itemCat">[' + TextTools.escapeHtml(item.category) + ']</div>\n'; }
    if (item.author) { htmlItem += '        <div class="itemAuthor">Posted by ' + TextTools.escapeHtml(item.author) + '</div>\n'; }
    if (item.pubDate) { htmlItem += '        <div class="itemPubDate">' + TextTools.escapeHtml(item.pubDateText) + '</div>\n'; }
    if (item.enclosure) { htmlItem += '        <div class="itemEnclosure">' + FeedRenderer._getEnclosureHTML(item) + ' </div>\n'; }
    htmlItem += '      </div>\n';
    htmlItem += '    </div>\n';
    return htmlItem;
  }

  static async _getHtmlItemLine_async(item, itemNumber, tooltipsVisible) {
    //item: { id: id, number: 0, title: '', link: '', description: '', category : '', author: '', pubDate: '', pubDateText: '' };
    let title = item.title;
    if (!title) { title = '(No Title)'; }
    let target = BrowserManager.instance.alwaysOpenNewTab ? 'target="_blank"' : '';
    let num = itemNumber ? itemNumber : item.number;
    let visited = '';
    try {
      visited = (await BrowserManager.isVisitedLink_async(item.link)) ? ' visited visitedVisible' : '';
    }
    catch (e) {
      /*eslint-disable no-console*/
      console.error(e);
      /*eslint-enable no-console*/
    }
    let tooltipText = FeedParser.getItemTooltipText(item, num);
    let tooltip = (tooltipsVisible ? 'title' : 'title1') + '="' + BrowserManager.htmlToText(tooltipText) + '"';
    let safeLink = TextTools.sanitizeUrl(item.link);
    let safeTitle = TextTools.escapeHtml(title);
    let htmlItemLine = '<span class="item' + visited + '" ' + tooltip + ' ' + target + ' href="' + safeLink + '" num="' + num + '">' + num + '. ' + safeTitle + '<br/></span>';
    return htmlItemLine;
  }
}