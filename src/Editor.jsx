import Highlight, { defaultProps } from 'prism-react-renderer';
import Prism from 'prismjs';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';
import { Code } from '@mantine/core';
import { useEditable } from 'use-editable';
import theme from './themes/nordLight';

// https://prismjs.com/extending.html
// https://github.com/PrismJS/prism/blob/master/components/prism-sql.js

const builtins = [
  '(APPROXIMATE\\s+)?MUTUAL\\s+INFORMATION\\s+OF',
  '(CONDITIONED|CONSTRAINED)\\s+BY',
  'GENERATE',
  'GIVEN',
  'PROBABILITY(\\s+DENSITY)?\\s+OF',
  'UNDER',
];

const keywords = [
  'ALTER',
  'AS',
  'ASC',
  '(CREATE|DROP)\\s+(TABLE|MODEL)',
  'DESC',
  'DISTINCT',
  'EXISTS',
  'FROM',
  'GROUP\\s+BY',
  'IF',
  'INCORPORATE',
  '(INNER|CROSS)\\s+JOIN',
  'INSERT',
  'INTO',
  'IS',
  'LIMIT',
  'ON',
  'ORDER\\s+BY',
  'SELECT',
  'SET',
  'UPDATE',
  'VALUES',
  'VAR',
  'WHERE',
  'WITH',
];

const functions = ['AVG', 'COUNT', 'MAX', 'MIN', 'MEDIAN', 'STD'];

// FIXME: Operators have a different background.
// https://github.com/PrismJS/prism/blob/e0ee93f138b7da294a28db50b97c22977fdfc8ed/themes/prism.css#L110
// https://github.com/PrismJS/prism/pull/2309

const operators = ['AND', 'NOT', 'OR'];

// https://prismjs.com/tokens.html#standard-tokens

Prism.languages.iql = {
  boolean: /\b(?:true|false)\b/,
  constant: /\bNULL\b/i,
  number: /\b-?[0-9]+\.?(?:[0-9]+)?\b/,
  punctuation: /;\s*$/,

  string: {
    pattern: /"(?:[^"]*)+"/,
    greedy: true,
  },

  variable: {
    pattern: /(VAR\s+)[^0-9\s][\w\-_?.]*/i,
    lookbehind: true,
  },

  builtin: new RegExp(`\\b(?:${builtins.join('|')})\\b`, 'i'),
  keyword: new RegExp(`\\b(?:${keywords.join('|')})\\b`, 'i'),
  function: new RegExp(`\\b(?:${functions.join('|')})(?=\\s*\\()`, 'i'),
  operator: new RegExp(`[+\\-*\\/><=/>]|${operators.join('|')}\\b`, 'i'),
};

const Editor = React.forwardRef(
  ({ code, disabled, setCode, ...props }, forwardedRef) => {
    const ref = forwardedRef ?? useRef();
    const onChange = useCallback(
      (newCode) => {
        // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
        setCode(newCode.slice(0, -1));
      },
      [setCode]
    );

    useEditable(ref, onChange, {
      disabled,
      indentation: 2,
    });

    const onKeyDown = (event, ...params) => {
      if (props.onKeyDown) props.onKeyDown(event, ...params);
      if (event.key === 'Backspace' && event.altKey) {
        // Without this only one character is deleted.
        event.stopPropagation();
      }
    };

    return (
      // This component requires the use of the spreading operator to apply the
      // default properties.
      /* eslint-disable react/jsx-props-no-spreading */
      <Highlight
        {...defaultProps}
        Prism={Prism}
        theme={theme}
        code={code}
        language="iql"
      >
        {({ className, style, tokens, getTokenProps }) => (
          <Code
            className={className}
            onKeyDown={onKeyDown}
            ref={ref}
            style={{ padding: '10px', display: 'block', ...style }}
          >
            {tokens.map((line, i) => (
              // Tokens is static and will not change.
              /* eslint-disable react/no-array-index-key */
              <React.Fragment key={i}>
                {line
                  .filter((token) => !token.empty)
                  .map((token, key) => (
                    // Tokens is static and will not change.
                    /* eslint-disable react/jsx-key */
                    <span {...getTokenProps({ token, key })} />
                  ))}
                {'\n'}
              </React.Fragment>
            ))}
          </Code>
        )}
      </Highlight>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;

Editor.propTypes = {
  code: PropTypes.string,
  disabled: PropTypes.bool,
  onKeyDown: PropTypes.func,
  setCode: PropTypes.func.isRequired,
};

Editor.defaultProps = {
  code: '',
  disabled: false,
  onKeyDown: undefined,
};
