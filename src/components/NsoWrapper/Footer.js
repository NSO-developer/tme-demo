import React from 'react';
import { PureComponent } from 'react';
import classNames from 'classnames';
import Comet from '../../utils/Comet';


class Footer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { closed: false };
  }

  close = () => {
    this.setState({ closed: true });
  }

  open = () => {
    this.setState({ closed: false });
  }

  render() {
    const { applications, current, hasWriteTransaction } = this.props;
    const { closed } = this.state;
    console.debug('NSO Footer Render');
    return (
      <div className="nso-footer">
        <button className={classNames('nso-footer__toggle-btn', {
          'nso-footer__toggle-btn--closed': closed
        })} onClick={this.open}>
          <div className="nso-footer__toggle-btn-text">⌃</div>
        </button>
        <div className={classNames('nso-footer__sc-menu', {
          'nso-footer__sc-menu--closed': closed
        })}>
          <button
            className="nso-footer__sc-menu-toggle-btn"
            onClick={this.close}
          />
          {applications.map(({ href, title, abb }) =>
            <a key={abb} className={classNames('nso-footer__sc-item', {
              'nso-footer__sc-item--current': title === current
            })} onClick={() => { Comet.stopThenGoToUrl(href); }}>
              <div className="nso-footer__sc-letter">{abb +
                (abb === 'C' && hasWriteTransaction ? '*' : '')}</div>
              <div className="nso-footer__sc-text">{title}</div>
            </a>
          )}
          <button
            className="nso-footer__sc-menu-toggle-btn"
            onClick={this.close}
          >
            <div className=
              "nso-footer__toggle-btn-text nso-footer__toggle-btn-text--down"
            >⌃</div>
          </button>
        </div>
      </div>
    );
  }
}

export default Footer;
