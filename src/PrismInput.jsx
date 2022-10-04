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

const PrismInput = React.forwardRef(
  ({ disabled, indentation, onChange, onKeyDown, value }, forwardedRef) => {
    const ref = forwardedRef ?? useRef();

    const handleChange = useCallback(
      (newCode) => {
        // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
        onChange(newCode.slice(0, -1));
      },
      [onChange]
    );

    useEditable(ref, handleChange, { disabled, indentation });

    const handleKeyDown = (event, ...params) => {
      if (onKeyDown) onKeyDown(event, ...params);
      if (event.key === 'Backspace' && event.altKey) {
        // Without this only one character is deleted.
        event.stopPropagation();
      }
    };

    return (
      <Highlight
        {...defaultProps}
        Prism={Prism}
        theme={theme}
        code={value}
        language="iql"
      >
        {({ className, style, tokens, getTokenProps }) => (
          <Code
            className={className}
            onKeyDown={handleKeyDown}
            ref={ref}
            style={{
              display: 'block',
              overflowX: 'auto',
              padding: '10px',
              whiteSpace: 'pre',
              ...style,
            }}
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

PrismInput.displayName = 'PrismInput';

export default PrismInput;

PrismInput.propTypes = {
  disabled: PropTypes.bool,
  indentation: PropTypes.number,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  value: PropTypes.string,
};

PrismInput.defaultProps = {
  disabled: false,
  indentation: 2,
  onChange: undefined,
  onKeyDown: undefined,
  value: '',
};
