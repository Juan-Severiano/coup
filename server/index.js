const express = require('express');
const moment = require('moment');
const cors = require('cors');

// Server/express setup
const app = express();

// Configuração do CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));

const server = require('http').createServer(app);

// Configuração do Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  allowEIO3: true
});

const CoupGame = require('./game/coup');
const utilities = require('./utilities/utilities');

// Constants
const port = 8000;

let namespaces = {}; //AKA party rooms

app.get('/createNamespace', function (req, res) { 
    let newNamespace = '';
    while(newNamespace === '' || (newNamespace in namespaces)) {
        newNamespace = utilities.generateNamespace(); //default length 6
    }
    const newSocket = io.of(`/${newNamespace}`);
    openSocket(newSocket, `/${newNamespace}`);
    namespaces[newNamespace] = {
        created: Date.now(),
        lastActivity: Date.now()
    };
    console.log(newNamespace + " CREATED")
    res.json({namespace: newNamespace});
})

app.get('/exists/:namespace', function (req, res) {
    const namespace = req.params.namespace;
    if (namespace in namespaces) {
        namespaces[namespace].lastActivity = Date.now();
        res.json({exists: true});
    } else {
        res.json({exists: false});
    }
})

const INFLUENCES = ['duke', 'assassin', 'captain', 'ambassador', 'contessa'];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function dealInfluences(playerCount) {
    // Criar deck com todas as cartas (3 de cada)
    let deck = [...INFLUENCES, ...INFLUENCES, ...INFLUENCES].slice();
    deck = shuffleArray(deck);
    
    // Distribuir 2 cartas para cada jogador
    const playerHands = [];
    for (let i = 0; i < playerCount; i++) {
        playerHands.push([deck.pop(), deck.pop()]);
    }
    
    return playerHands;
}

//game namespace: oneRoom
openSocket = (gameSocket, namespace) => {
    let players = []
    let partyMembers = []
    let partyLeader = ''
    let started = false

    const updatePartyList = () => {
        partyMembers = players
            .filter(x => x.player !== '' && !x.disconnected)
            .map(x => ({
                name: x.player,
                socketID: x.socket_id,
                isReady: x.isReady,
                isLeader: x.socket_id === partyLeader
            }))
        console.log('Current party members:', partyMembers)
        gameSocket.emit('partyUpdate', partyMembers)
    }

    gameSocket.on('connection', (socket) => {
        console.log('New connection:', socket.id, 'to namespace:', namespace)
        
        const playerName = socket.handshake.query.playerName
        
        // Check if the player is reconnecting
        const existingPlayerIndex = players.findIndex(p => p.player === playerName)
        if (existingPlayerIndex !== -1) {
            // Update the socket ID for the reconnecting player
            players[existingPlayerIndex].socket_id = socket.id
            players[existingPlayerIndex].disconnected = false
            socket.emit('joinSuccess')
            if (players[existingPlayerIndex].socket_id === partyLeader) {
                socket.emit('leader')
            }
            updatePartyList()
        } else {
            players.push({
                player: playerName || '',
                socket_id: socket.id,
                isReady: false,
                disconnected: false
            })
        }

        socket.on('setName', (name) => {
            console.log('Setting name:', name, 'for socket:', socket.id)
            
            if (started) {
                socket.emit('joinFailed', 'game_already_started')
                return
            }

            const nameExists = players.some(p => 
                p.player === name && p.socket_id !== socket.id && !p.disconnected
            )

            if (!nameExists) {
                if (partyMembers.length >= 6) {
                    socket.emit('joinFailed', 'party_full')
                } else {
                    const playerIndex = players.findIndex(p => p.socket_id === socket.id)
                    if (playerIndex !== -1) {
                        players[playerIndex].player = name
                        
                        if (!partyLeader) {
                            partyLeader = socket.id
                            players[playerIndex].isReady = true
                            socket.emit('leader')
                            console.log('New leader:', socket.id)
                        }
                        
                        socket.emit('joinSuccess')
                        updatePartyList()
                    }
                }
            } else {
                socket.emit('joinFailed', 'name_taken')
            }
        })

        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id)
            
            const playerIndex = players.findIndex(p => p.socket_id === socket.id)
            if (playerIndex !== -1) {
                players[playerIndex].disconnected = true
            }
            
            if (socket.id === partyLeader) {
                console.log('Leader disconnected')
                
                // Choose a new leader if possible
                const newLeader = players.find(p => !p.disconnected && p.socket_id !== socket.id)
                if (newLeader) {
                    partyLeader = newLeader.socket_id
                    gameSocket.to(partyLeader).emit('leader')
                    updatePartyList()
                } else {
                    // If no players left, clean up the room after a delay
                    setTimeout(() => {
                        if (players.every(p => p.disconnected)) {
                            const namespaceName = namespace.substring(1)
                            if (io._nsps.has(namespace)) {
                                io._nsps.delete(namespace)
                                delete namespaces[namespaceName]
                            }
                            players = []
                            partyMembers = []
                            partyLeader = ''
                            console.log('Room cleaned up:', namespaceName)
                        }
                    }, 60000) // 1 minute delay
                }
            }
            
            updatePartyList()
        })

        socket.on('setReady', (isReady) => {
            console.log('Player setting ready:', socket.id, isReady)
            const playerIndex = players.findIndex(p => p.socket_id === socket.id)
            if (playerIndex !== -1) {
                players[playerIndex].isReady = isReady
                socket.emit('readyConfirm')
                updatePartyList()
            }
        })

        socket.on('startGameSignal', () => {
            if (socket.id === partyLeader) {
                const readyPlayers = players.filter(p => p.isReady && p.player !== '')
                
                if (readyPlayers.length >= 2) {
                    console.log('Starting game with players:', readyPlayers)
                    started = true
                    
                    const playerHands = dealInfluences(readyPlayers.length)
                    
                    const gameState = {
                        currentPlayer: readyPlayers[0].socket_id,
                        players: readyPlayers.map((p, index) => ({
                            name: p.player,
                            socketID: p.socket_id,
                            isReady: true,
                            money: 2,
                            influences: playerHands[index],
                            isDead: false,
                            color: `hsl(${(index * 360) / readyPlayers.length}, 70%, 50%)`
                        }))
                    }
                    
                    gameSocket.emit('gameStart', gameState)
                    
                    gameState.players.forEach(player => {
                        gameSocket.to(player.socketID).emit('privateState', {
                            influences: player.influences
                        })
                    })
                }
            }
        })
    })
}

setInterval(() => {
    const now = Date.now();
    for (const [namespace, data] of Object.entries(namespaces)) {
        if (now - data.lastActivity > 3600000) { // 1 hour of inactivity
            if (io._nsps.has(`/${namespace}`)) {
                io._nsps.delete(`/${namespace}`);
            }
            delete namespaces[namespace];
            console.log('Inactive namespace removed:', namespace);
        }
    }
}, 900000);

server.listen(process.env.PORT || port, function(){
    console.log(`listening on ${process.env.PORT || port}`);
});