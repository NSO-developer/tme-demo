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

  async getConfig(format, serviceMetaData) {
    const { device, handleError } = this.props;
    this.setState({ isFetching: true });
    try {
      const result = await JsonRpc.runAction({
        path: `/ncs:devices/ncs:device{${device}}/tme-demo:get-configuration`,
        params: { format, 'service-meta-data': serviceMetaData }
      });
      this.setState({
        isFetching: false,
        config: this.formatConfig(result.config, result.format),
        format: result.format,
        serviceMetaData
      });
      this.forceUpdate();
    } catch(exception) {
      this.setState({ isFetching: false });
      handleError('Failed to fetch device configuration', exception);
    }
  }

  trim(configLines) {
    const indent = configLines.length > 0 ? configLines[0].search(/\S/) : 0;
    return configLines.map(line => line.substr(indent));
  }

  reIndent(configLines, level=2) {
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
  }

  pretty(configLines, format) {
    if (['cli', 'yaml'].includes(format)) {
      return this.trim(configLines);
    } else if (format == 'json') {
      return this.reIndent(configLines, 1);
    } else {
      return this.reIndent(configLines);
    }
  }

  slice(configLines, format) {
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
  }

  formatConfig(config, format) {
    const configLines = this.slice(config.split('\n'), format);
    return this.pretty(configLines, format).join('\n');
  }

  btn = (label, selectFormat, tooltip, toggleServiceMetaData, rightAlign) => {
    const { format, serviceMetaData, isFetching } = this.state;
    return (
      <Tippy placement="bottom" content={tooltip}>
        <button
          onClick={() => {
            this.getConfig(selectFormat || format,
              toggleServiceMetaData ? !serviceMetaData : serviceMetaData);
          }}
          className={classNames('nso-btn', 'nso-btn--config-viewer', {
            'nso-btn--inactive': toggleServiceMetaData ?
              !serviceMetaData : format !== selectFormat,
            'nso-btn--disabled': isFetching,
            'nso-btn--right-align': rightAlign
          })}
        >{label}</button>
      </Tippy>
    );
  };

  render() {
    console.debug('Config Render');
    const { device } = this.props;
    const { format, serviceMetaData, isFetching, config } = this.state;
    const highlightedConfig = config && ['json', 'xml', 'yaml'].includes(format)
      ? hljs.highlight(format, config).value : config;

    const header = <Fragment>{device}{isFetching &&
      <div className="config-viewer__loading-dots">
        <span className="loading__dot"/>
        <span className="loading__dot"/>
        <span className="loading__dot"/>
      </div>}
    </Fragment>;

    return (
      <Accordion header={header} level="1" right={true} startOpen={true}>
        <div className="config-viewer__panel">
          <div className="config-viewer__btn-row">
            {this.btn('cli', 'cli', 'Format configuration as Cisco-style CLI')}
            {this.btn('cb', 'curly-braces',
              'Format configuration as Juniper-style curly braces')}
            {this.btn('json', 'json', 'Format configuration as JSON')}
            {this.btn('xml', 'xml', 'Format configuration as XML')}
            {this.btn('yaml', 'yaml', 'Format configuration as YAML')}
            {serviceMetaData
              ? this.btn('svc-meta', null,
                'Exclude service meta-data annotations', true, true)
              : this.btn('svc-meta', null,
                'Include service meta-data annotations', true, true)
            }
          </div>
          <pre className="config-viewer__config-text">
            <code dangerouslySetInnerHTML={
              { __html: highlightedConfig ||
                '<br/>Fetching config...<br/><br/>'}}/>
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
