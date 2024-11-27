import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import classNames from 'classnames';


const WEBSOCKET_PORT = 4000;

const BELL = 7;
const BACKSPACE = 8;
const NL = 10;
const CR = 13;

function Terminal({
  ip, port, username, password, keypath, active, history: initialHistory
}) {
  console.debug('Terminal Render');

  const wrapperRef = useRef(null);

  const forwardCount = useRef(0);
  const backCount = useRef(0);
  const cursorBuffer = useRef('');
  const gotCR = useRef(false);

  const [ lineBuffer, setLineBuffer ] = useState('');
  const [ history, setHistory ] = useState([ initialHistory ]);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    `ws://${location.hostname}:${WEBSOCKET_PORT}`,
    { queryParams: { ip, port, username, password },
      onOpen: () => { getWebSocket().binaryType = 'arraybuffer'; }
    }
  );

  const resetCursorBuffer = () => {
    cursorBuffer.current = '';
    backCount.current = 0;
    forwardCount.current = 0;
  };


  useEffect(() => {
    if (readyState == ReadyState.CLOSED) {
      resetCursorBuffer();
      setHistory(history.concat(lineBuffer));
      setLineBuffer('Connection closed.');
    }
  }, [ readyState ]);

  useEffect(() => {
    if (active) {
      wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      wrapperRef.current.focus();
    }
  }, [ lineBuffer ]);

  useEffect(() => {
    let chunksBuffer = lineBuffer;
    let lines = [];

    const clearChunksBuffer = () => {
      chunksBuffer = '';
      gotCR.current = false;
    };

    new Uint8Array(lastMessage?.data).forEach(charCode => {
      if (backCount.current > 0) {
        backCount.current--;
        if (charCode != BELL) {
          cursorBuffer.current = chunksBuffer.slice(-1) + cursorBuffer.current;
        }
      }
      if (forwardCount.current > 0) {
        forwardCount.current--;
        if (charCode != BELL) {
          cursorBuffer.current = cursorBuffer.current.slice(1);
        }
      }

      if (charCode == BACKSPACE) {
        chunksBuffer = chunksBuffer.slice(0, -1);
      }
      else if (charCode == CR) {
        gotCR.current = true;
      }
      else if (charCode == NL) {
        lines.push(chunksBuffer.concat(cursorBuffer.current));
        resetCursorBuffer();
        clearChunksBuffer();
      }
      else if (charCode !== BELL && charCode < 240) {
        if (gotCR.current) {
          clearChunksBuffer();
        }
        chunksBuffer = chunksBuffer + String.fromCharCode(charCode);
      }
    });

    setLineBuffer(chunksBuffer);
    if (lines) {
      setHistory(history.concat(lines));
    }
  }, [ lastMessage ]);

  const sendKeyCode = (keyCode) => {
    const buffer = new ArrayBuffer(1);
    const bufferView = new Uint8Array(buffer);
    bufferView[0] = keyCode;
    sendMessage(buffer);
  };

  const sendEscapeSequence = (keyCode) => {
    const buffer = new ArrayBuffer(3);
    const bufferView = new Uint8Array(buffer);
    bufferView[0] = 27;
    bufferView[1] = 91;
    bufferView[2] = keyCode;
    sendMessage(buffer);
  };

  const handleKeyDown = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (['Backspace', 'Enter', 'Space', 'Tab'].includes(event.key)) {
      sendKeyCode(event.keyCode);
    }
    else if (event.key == 'ArrowUp') {
      resetCursorBuffer();
      sendEscapeSequence(65);
    }
    else if (event.key == 'ArrowDown') {
      resetCursorBuffer();
      sendEscapeSequence(66);
    }
    else if (event.key == 'ArrowLeft') {
      if (forwardCount.current == 0) {
        backCount.current += 1;
        sendEscapeSequence(68);
      }
    }
    else if (event.key == 'ArrowRight') {
      if (backCount.current == 0) {
        forwardCount.current += 1;
        sendEscapeSequence(67);
      }
    }
    else if (event.keyCode > 31) {
      if (event.ctrlKey && event.keyCode > 64) {
        if (event.keyCode <= 90) {
          sendKeyCode(event.keyCode - 64);
        } else {
          sendKeyCode(event.key.charCodeAt() - 64);
        }
      } else {
        sendKeyCode(event.key.charCodeAt());
      }
    }
  }, []);

  return (
    <div
      className={classNames('terminal', {
        'terminal--hidden': !active
      })}
      ref={wrapperRef}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <pre
        className="terminal__text"
      >{history.map(line =>
        `${line}\n`)}{lineBuffer}_{cursorBuffer.current}</pre>
    </div>
  );
}

export default Terminal;
