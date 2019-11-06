import React from 'react';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Tippy from '@tippy.js/react';

import hljs from 'highlight.js/lib/highlight.js';

import Accordion from '../Sidebar/Accordion';
import LoadingOverlay from '../common/LoadingOverlay';

import JsonRpc from '../../utils/JsonRpc';
import { handleError } from '../../actions/uiState';

const mapDispatchToProps = { handleError };

const trim = (configLines) => {
  const indent = configLines.length > 0 ? configLines[0].search(/\S/) : 0;
  return configLines.map(line => line.substr(indent));
};

const reIndent = (configLines, level=2) => {
  let indent = -level;
  let lastIndent = -1;
  return configLines.map(line => {
    const leadingSpace = line.search(/\S/);
    if (leadingSpace > lastIndent ) {
      indent += level;
    } else if (leadingSpace < lastIndent) {
      if (indent > 0) {
        indent -= level;
      }
    }
    lastIndent = leadingSpace;
    return (' '.repeat(indent) + line.trim());
  });
};

const pretty = (configLines, format) => {
  if (['cli', 'yaml'].includes(format)) {
    return trim(configLines);
  } else if (format == 'json') {
    return reIndent(configLines, 1);
  } else {
    return reIndent(configLines);
  }
};

const slice = (configLines, format) => {
  if (format == 'cli') {
    return configLines.slice(1, -2);
  } else if (format == 'curly-braces') {
    return configLines.slice(2, -3);
  } else if (format == 'json') {
    return configLines.splice(0, 1).concat(configLines.slice(5, -5));
  } else if (format == 'yaml') {
    return configLines.slice(3, -2);
  } else if (format == 'xml') {
    return configLines.slice(4, -3);
  } else {
    return configLines;
  }
};

const formatConfig = (config, format) => {
  const configLines = slice(config.split('\n'), format);
  return pretty(configLines, format).join('\n');
};

class Config extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      config: undefined,
      format: undefined,
      serviceMetaData: false
    };
  }

  async componentDidMount() {
    this.getConfig(undefined, false);
  }

  async getConfig(format) {
    const { device, handleError } = this.props;
    this.setState({ isFetching: true });
    try {
      const result = await JsonRpc.runAction({
        path: `/ncs:devices/ncs:device{${device}}/tme-demo:get-configuration`,
        params: { format, 'service-meta-data': true }
      });
      this.setState({
        isFetching: false,
        config: formatConfig(result.config, result.format),
        format: result.format,
      });
    } catch(exception) {
      this.setState({ isFetching: false });
      handleError('Failed to fetch device configuration', exception);
    }
  }

  getBackpointerRegex() {
    const { format } = this.state;
    if (format == 'cli') {
      return /<span class="hljs-comment">! Backpointer: \[(.*)\][^\]]*<\/span>/;
    } else if (format == 'curly-braces') {
      return /<span class="hljs-comment">\/\* Backpointer: \[(.*)\] \*\/<\/span>/;
    } else if (format == 'xml') {
      return / <span class="hljs-attr">backpointer<\/span>=<span class="hljs-string">"([^"]*)"<\/span> /;
    }
  }

  getRefcountRegex() {
    const { format } = this.state;
    if (format == 'cli') {
      return /<span class="hljs-comment">! Refcount: .*<\/span>/;
    } else if (format == 'curly-braces') {
      return /<span class="hljs-comment">\/\* Refcount: .*<\/span>/;
    } else if (format == 'xml') {
      return / <span class="hljs-attr">refcounter<\/span>=<span class="hljs-string">".d*"<\/span> /;
    }
  }

  highlightService(highlightedConfig) {
    const { format, serviceMetaData } = this.state;
    const { openTenant } = this.props;

    let highlightLine = false;
    let highlightBlock = false;
    let blockIndent = undefined;

    return highlightedConfig.split('\n').reduce((acc, line) => {
      if (['cli', 'curly-braces', 'xml'].includes(format)) {
        const indent = line.search(/\S/);
        const refcountMatch = line.search(this.getRefcountRegex()) != -1;
        const backpointerMatch = line.match(this.getBackpointerRegex());
        const backpointer = backpointerMatch ? backpointerMatch[1] : '';
        const isOnlyMeta = ['cli', 'curly-braces'].includes(format) &&
          (refcountMatch || backpointerMatch);

        if (backpointer.includes(openTenant)) {
          if (!highlightBlock) {
            blockIndent = indent;
          }
        }

        if (indent >= blockIndent) {
          highlightLine = true;
          if (backpointer && !backpointer.includes(openTenant)) {
            highlightLine = false;
          }
        }

        if (format == 'xml' && !serviceMetaData) {
          line = line.replace(this.getRefcountRegex(), '').replace(
            this.getBackpointerRegex(), '');
        }

        if (serviceMetaData || !isOnlyMeta) {
          if (highlightLine) {
            acc.push([ line, !isOnlyMeta ]);
            highlightLine = false;
            if (indent == blockIndent && !isOnlyMeta) {
              if (highlightBlock) {
                highlightBlock = false;
                blockIndent = undefined;
              } else {
                highlightBlock = true;
              }
            }
          } else {
            acc.push([ line, false ]);
          }
        }
      } else {
        acc.push([ line, false ]);
      }
      return acc;
    }, []);
  }

  btn = (label, selectFormat, tooltip) => {
    const { format, isFetching } = this.state;
    return (
      <Tippy placement="bottom" content={tooltip}>
        <button
          onClick={() => { this.getConfig(selectFormat || format); }}
          className={classNames('nso-btn', 'nso-btn--config-viewer', {
            'nso-btn--inactive': format !== selectFormat,
            'nso-btn--disabled': isFetching,
          })}
        >{label}</button>
      </Tippy>
    );
  };

  render() {
    console.debug('Config Render');
    const { device } = this.props;
    const { format, serviceMetaData, isFetching, config } = this.state;

    return (
      <Accordion
        level="1"
        right={true}
        startOpen={true}
        variableHeight={true}
        header={<Fragment>{device}{isFetching &&
          <div className="config-viewer__loading-dots">
            <span className="loading__dot"/>
            <span className="loading__dot"/>
            <span className="loading__dot"/>
          </div>}
        </Fragment>}>
        <div className="config-viewer__panel">
          <div className="config-viewer__btn-row">
            {this.btn('cli', 'cli', 'Format configuration as Cisco-style CLI')}
            {this.btn('cb', 'curly-braces',
              'Format configuration as Juniper-style curly braces')}
            {this.btn('json', 'json', 'Format configuration as JSON')}
            {this.btn('xml', 'xml', 'Format configuration as XML')}
            {this.btn('yaml', 'yaml', 'Format configuration as YAML')}
            <Tippy placement="bottom" content={`${serviceMetaData ? 'Exclude' :
              'Include'} service meta-data annotations`}>
              <button
                onClick={() => {
                  this.setState({ serviceMetaData: !serviceMetaData });
                }}
                className={classNames('nso-btn', 'nso-btn--config-viewer',
                  'nso-btn--right-align', {
                    'nso-btn--inactive': !serviceMetaData,
                    'nso-btn--disabled': isFetching
                })}
              >svc-meta</button>
            </Tippy>
          </div>
          <pre className="config-viewer__pre">
            <code className="config-viewer__code">{config && format ?
              this.highlightService(hljs.highlight(format, config).value).map(
                ([ configLine, highlight ], index) => <div key={index}
                  className={classNames(
                    'config-viewer__line', {
                    'config-viewer__line--highlight': highlight
                  })}
                  dangerouslySetInnerHTML={{ __html: configLine }}
                />)
              : <div>Fetching config...</div>
            }</code>
          </pre>
          <div
            className="loading__overlay"
            style={{ opacity: isFetching | 0 }}
          />
        </div>
      </Accordion>
    );
  }
}

export default connect(null, mapDispatchToProps)(Config);
