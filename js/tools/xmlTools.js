/*eslint-disable quotes*/
'use strict';

class XmlTools { /*exported XmlTools*/
  static escapeTextXml(text) {
    let escapedText = text
      .replace(/&(?!amp;)/g, '%26')
      .replace(/</g, '%3c')
      .replace(/>/g, '%3e')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27');
    return escapedText;
  }

  static escapeUrlXml(text) {
    let escapedText = text
      .replace(/&(?!amp;)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    return escapedText;
  }

  static unescapeTextXml(text) {
    let unescapedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")

      .replace(/%26/g, '&')
      .replace(/%3c/gi, '<')
      .replace(/%3e/gi, '>')
      .replace(/%22/g, '"')
      .replace(/%27/g, "'");
    return unescapedText;
  }

  static unescapeTextAll(text) {
    try {
      return decodeURIComponent(text);
    } catch (e) {
      return text;
    }
  }

  static unescapeUrlXml(text) {
    return XmlTools.unescapeTextXml(text);
  }

  /**
   * Sanitizes XML content to prevent XXE (XML External Entity) attacks
   * by removing potential XXE payloads before parsing
   * @param {string} xmlText - The XML text to sanitize
   * @returns {string} - Sanitized XML text safe for parsing
   */
  static sanitizeXmlForXxe(xmlText) {
    if (!xmlText) {
      return xmlText;
    }

    // Remove XML external entity declarations
    // This prevents <!ENTITY and <!DOCTYPE declarations that could reference external entities
    let sanitized = xmlText.replace(/<!ENTITY\s+[^>]*>/gi, '');
    sanitized = sanitized.replace(/<!DOCTYPE\s+[^>]*>/gi, '');

    // Remove potential external entity references
    // This prevents &entityName; references that could be expanded
    sanitized = sanitized.replace(/&[a-zA-Z][a-zA-Z0-9-]*;/g, (match) => {
      // Only remove known external entity references
      // Common XML entities like <, >, &, ", ' are safe
      const knownEntities = ['lt', 'gt', 'amp', 'quot', 'apos'];
      const entityName = match.substring(1, match.length - 1);
      return knownEntities.includes(entityName) ? match : '';
    });

    return sanitized;
  }

}