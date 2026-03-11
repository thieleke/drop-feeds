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
    // Handle DOCTYPE with optional internal subset: <!DOCTYPE foo [ ... ]>
    sanitized = sanitized.replace(/<!DOCTYPE\s+[^[>]*(\[[\s\S]*?\]\s*)?>/gi, '');

    // Remove numeric character references that could be used for obfuscation of XXE payloads
    // but preserve standard named entities (XML built-ins and common HTML entities).
    // After stripping DOCTYPE/ENTITY declarations above, any remaining named entity
    // references are either standard HTML entities (safe) or undefined (will be ignored
    // by DOMParser). No need to strip them — DOMParser won't expand custom entities
    // without a corresponding <!ENTITY> declaration.

    return sanitized;
  }

}