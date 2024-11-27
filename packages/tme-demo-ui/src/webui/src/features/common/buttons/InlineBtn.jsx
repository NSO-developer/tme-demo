import React from 'react';
import { Fragment, forwardRef } from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

import { BTN_CONFIRM } from 'constants/Icons';
import Btn from './BtnWithTooltip';

const InlineBtn = forwardRef(
  function InlineBtn({ icon, tooltip, onClick, label, align, style, hidden, disabled }, ref)
{
  return (
    <Tippy placement="bottom" content={tooltip}>
      <button
        className={classNames(
          `btn__${style || (icon ? 'tertiary' : 'secondary')}`,
          {
            'btn__round': icon && !label,
            'btn__round-with-label': icon && label,
            'btn__right-align': align === 'right',
            'btn--hidden': hidden,
            'btn--disabled': disabled
          }
        )}
        ref={ref}
        onClick={onClick}
        type={icon === BTN_CONFIRM ? 'submit' : 'button'}
      >
        <Fragment>{icon && (!label
          ? <Btn type={icon} />
          : <span className="btn__round" >
              <Btn type={icon} />
            </span>
          )} {label &&
          <span className="btn__label">{label}</span>}
        </Fragment>
      </button>
    </Tippy>
  );
});

export default InlineBtn;
