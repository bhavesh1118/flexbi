import net from 'net';

const server = net.createServer();
server.listen(3001, () => {
  console.log('✅ Port 3001 is available');
  server.close();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 3001 is already in use');
    console.log('Please check if another application is using this port');
  } else {
    console.log('❌ Error:', err.message);
  }
});
