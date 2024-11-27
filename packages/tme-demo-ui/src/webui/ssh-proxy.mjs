import url from 'url';
import { NodeSSH } from 'node-ssh';
import { WebSocketServer, createWebSocketStream } from 'ws';
import { pipeline } from 'node:stream/promises';

const wss = new WebSocketServer({ port: 4000 });

wss.on('connection', async (connection, request) => {
  const send = (message) => {
    const messageLength = message.length;
    const buffer = new ArrayBuffer(messageLength);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < messageLength; i++) {
      bufferView[i] = message.charCodeAt(i);
    }
    connection.send(buffer);
  };

  const ssh = new NodeSSH();
  const duplex = createWebSocketStream(connection, { encoding: 'ascii' });
  const { ip, port, username, password } = url.parse(request.url, true).query;

  const params = {
    host: ip,
    port,
    username,
    password
  };

  connection.on('close', () => {
     ssh.dispose();
  });

  try {
    send(`Trying to connect to ${ip} : ${port}... `);
    await ssh.connect(params);
    send(`Connected!\r\n\r\n`);

    const stream = await ssh.requestShell({
      term: 'dumb',
      rows: 255,
      cols: 50,
    });

    send('Press ENTER to start.\r\n');

    connection.cleanup = () => {
      stream.end();
      duplex.end();
      ssh.dispose();
    };

    stream.on('exit', async () => {
      const { state } = stream.incoming;
      stream.incoming.state = 'closed';
      await duplex.end();
      stream.incoming.state = state;
      stream.push(null);
    });

    stream.on('close', () => {
      ssh.connection?._chanMgr?.cleanup();
    });

    duplex.on('end', async () => {
      await stream.push(null);
    });

    await Promise.all([ pipeline(duplex, stream), pipeline(stream, duplex) ]);
  }
  catch(error) {
    send(error.message);
    console.log(error);
  }
  finally {
    ssh.dispose();
  }

});


function handleExit() {
  wss.clients.forEach(connection => connection.cleanup && connection.cleanup());
  wss.close();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
