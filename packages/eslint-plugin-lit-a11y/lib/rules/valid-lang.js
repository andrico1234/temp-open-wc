/**
 * @fileoverview Ensures the document has a valid `lang` attribute.
 * @author open-wc
 */

const ruleExtender = require('eslint-rule-extender');
const tags = require('language-tags');
const { TemplateAnalyzer } = require('eslint-plugin-lit/lib/template-analyzer.js');
const { elementHasAttribute } = require('../utils/elementHasAttribute');
const { HasLitHtmlImportRuleExtension } = require('../utils/HasLitHtmlImportRuleExtension');
const { isHtmlTaggedTemplate } = require('../utils/isLitHtmlTemplate');

const ValidLangRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensures the document has a valid `lang` attribute.',
      category: 'Accessibility',
      recommended: false,
      url:
        'https://github.com/open-wc/open-wc/blob/master/packages/eslint-plugin-lit-a11y/docs/rules/valid-html.md',
    },
    messages: {
      noLangPresent: 'No lang attribute is present.',
      invalidLang: 'The value passed through to lang is not BCP 47 compliant.',
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    return {
      TaggedTemplateExpression(node) {
        if (isHtmlTaggedTemplate(node, context)) {
          const analyzer = TemplateAnalyzer.create(node);

          analyzer.traverse({
            enterElement(element) {
              if (element.name === 'html') {
                if (!elementHasAttribute(element, 'lang')) {
                  const loc = analyzer.resolveLocation(element.sourceCodeLocation.startTag);

                  return context.report({
                    loc,
                    messageId: 'noLangPresent',
                  });
                }

                let { lang } = element.attribs;

                const expr = analyzer.getAttributeValue(element, 'lang', context.getSourceCode());

                if (typeof expr !== 'string') {
                  if (expr.type === 'Literal') {
                    lang = `${expr.value}`;
                  }
                }

                if (!tags.check(lang)) {
                  const loc = analyzer.getLocationForAttribute(element, 'lang');

                  console.log('locloc', loc);

                  return context.report({
                    loc,
                    messageId: 'invalidLang',
                  });
                }
              }
            },
          });
        }
      },
    };
  },
};

module.exports = ruleExtender(ValidLangRule, HasLitHtmlImportRuleExtension);
