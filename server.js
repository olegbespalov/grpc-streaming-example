const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const { CHAT_ADDR, Info } = require('./common');

const PROTO_PATH = __dirname + '/chat.proto';

// Load the protobuf definition
let packageDefinition = protoLoader.loadSync(
   PROTO_PATH,
   {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
   }
);

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

// Map to store the clients
let clients = new Map();
const server = new grpc.Server();

server.addService(chatProto.ChatService.service, {
   chat: (call) => {
      let user = call.metadata.get('username');

      if (!user || user.length == 0) {
         call.write({
            from: 'Server',
            message: 'Sorry, but you need to provide a username'
         });

         Info('Someone tried to connect without a username');

         call.end();
         return;
      }

      user = user[0];

      Info(`${user} joined the chat`);
      
      if (clients.get(user) === undefined) {         
         clients.set(user, call);
      }

      // a nice welcome message
      call.write({
         from: 'Server',
         message: `Welcome to the chat. ${clients.size-1} users online`,
      });
      
      // distribute the message to all the clients
      call.on('data', (r) => {
         let msg = r.message;

         Info(`${user} sent a message "${msg}"`);
   
         for (let [key, stream] of clients) {
            if (key == user) {
               continue
            }
      
            stream.write({
               from: user,
               message: msg
            });
         }         
      });
   
      // send a nice bye message, unregister the client and close the stream
      call.on('end', () => {         
         Info(`${user} left the chat`);
   
         call.write({
            from: 'Server',
            message: 'Bie!'
         });
         call.end();

         clients.delete(user);         
      });
   }
});

server.bind(CHAT_ADDR, grpc.ServerCredentials.createInsecure());
Info(`starting the chat server on ${CHAT_ADDR}`);

server.start();