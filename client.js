const PROTO_PATH = __dirname + '/chat.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const { Info, CHAT_ADDR } = require('./common');

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

let username = process.argv[2] ?? null;

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

const client = new chatProto.ChatService(CHAT_ADDR, grpc.credentials.createInsecure());

const metadata = new grpc.Metadata();

if (username) {   
   metadata.add('username', username);
}

try {
   Info(`connecting to ${CHAT_ADDR} with "${username}" username`);
   const stream = client.chat(metadata);

   Info('connected..')

   stream.on('data', (m) => {
      Info(`${m.from}: ${m.message}`);
   });

   stream.on('error', (error) => {
      Info(`${error}`);

      stream.end();
      rl.close();
   });

   stream.on('end', () => {
      Info('end happened');

      stream.end();
      rl.close();
   });

   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
   });

   rl.on('line', (line) => {
      if (line === 'exit') {
         stream.end();
         rl.close();
         return;
      }

      stream.write({
         message: line
      });
   });
} catch (error) {
   Info(`can't connect to the chat server`);
}

