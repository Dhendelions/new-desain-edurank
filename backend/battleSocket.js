const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

function configureBattleSocket(server, secret) {
  const io = new Server(server, { cors: { origin: true, credentials: true } });
  const queues = new Map();
  const rooms = new Map();

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Sesi diperlukan.'));
      socket.user = jwt.verify(token, secret);
      next();
    } catch {
      next(new Error('Sesi tidak valid.'));
    }
  });

  const publicRoom = (room) => ({
    roomId: room.id,
    roomCode: room.roomCode || room.id,
    mode: room.mode,
    subject: room.subject,
    status: room.status,
    players: room.players.map(({ id, name, photo }) => ({ id, name, photo })),
    score: room.score || {},
    progress: room.progress || {},
    winner: room.winner || null
  });

  const emitRoom = (room, event = 'battle_state') => {
    io.to(room.id).emit(event, publicRoom(room));
  };

  io.on('connection', (socket) => {
    const player = {
      id: socket.user.id,
      name: socket.user.name || 'Pelajar EduRank',
      photo: socket.user.photo || '',
      socketId: socket.id
    };

    // QUEUE RANKED
    socket.on('queue_ranked', ({ subject }) => {
      const key = `ranked_${String(subject || 'Fisika').toLowerCase()}`;
      const existing = queues.get(key);

      if (existing && existing.id !== player.id) {
        queues.delete(key);
        const roomId = `room-${Date.now()}`;
        const room = {
          id: roomId,
          mode: 'ranked',
          subject: subject || 'Fisika',
          players: [existing, player],
          score: { [existing.id]: 0, [player.id]: 0 },
          status: 'started'
        };
        rooms.set(roomId, room);

        const s1 = io.sockets.sockets.get(existing.socketId);
        const s2 = io.sockets.sockets.get(player.socketId);
        if (s1) s1.join(roomId);
        if (s2) s2.join(roomId);

        emitRoom(room, 'match_found');
      } else {
        queues.set(key, player);
        socket.emit('matchmaking_waiting', { mode: 'ranked', subject });
      }
    });

    // QUEUE CLASSIC
    socket.on('queue_classic', ({ subject }) => {
      const key = `classic_${String(subject || 'Fisika').toLowerCase()}`;
      const existing = queues.get(key);

      if (existing && existing.id !== player.id) {
        queues.delete(key);
        const roomId = `room-${Date.now()}`;
        const room = {
          id: roomId,
          mode: 'classic',
          subject: subject || 'Fisika',
          players: [existing, player],
          score: { [existing.id]: 0, [player.id]: 0 },
          status: 'started'
        };
        rooms.set(roomId, room);

        const s1 = io.sockets.sockets.get(existing.socketId);
        const s2 = io.sockets.sockets.get(player.socketId);
        if (s1) s1.join(roomId);
        if (s2) s2.join(roomId);

        emitRoom(room, 'match_found');
      } else {
        queues.set(key, player);
        socket.emit('matchmaking_waiting', { mode: 'classic', subject });
      }
    });

    // CANCEL QUEUE
    socket.on('cancel_queue', () => {
      for (const [key, queued] of queues.entries()) {
        if (queued.socketId === socket.id) {
          queues.delete(key);
        }
      }
      socket.emit('queue_cancelled');
    });

    // CREATE PRIVATE CUSTOM ROOM WITH 6-DIGIT CODE
    socket.on('create_room', ({ subject, roomCode }) => {
      const code = roomCode || Math.floor(100000 + Math.random() * 900000).toString();
      const room = {
        id: code,
        roomCode: code,
        mode: 'custom',
        subject: subject || 'Fisika',
        players: [player],
        score: { [player.id]: 0 },
        status: 'lobby'
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit('room_created', publicRoom(room));
    });

    // JOIN PRIVATE CUSTOM ROOM VIA 6-DIGIT CODE
    socket.on('join_room', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        return socket.emit('battle_error', { message: 'Kode room tidak ditemukan atau telah kedaluwarsa.' });
      }
      if (room.players.length >= 2) {
        return socket.emit('battle_error', { message: 'Room sudah penuh (maksimal 2 pemain).' });
      }

      room.players.push(player);
      room.score[player.id] = 0;
      room.status = 'started';
      socket.join(room.id);

      emitRoom(room, 'match_found');
    });

    // LIVE BATTLE SCORE & PROGRESS UPDATE
    socket.on('battle_answer', ({ roomId, score, questionIndex }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (!room.score) room.score = {};
      if (!room.progress) room.progress = {};
      if (score !== undefined) {
        room.score[player.id] = score;
      }
      if (questionIndex !== undefined) {
        room.progress[player.id] = questionIndex;
      }
      emitRoom(room, 'battle_update');
    });

    // PLAYER READY FOR NEXT QUESTION
    socket.on('player_ready_next', ({ roomId, questionIndex }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      if (!room.readyForNext) room.readyForNext = {};
      room.readyForNext[player.id] = questionIndex;

      // Check if all real players (or 2 players if standard) are ready
      const allPlayersReady = room.players.every(p => room.readyForNext[p.id] === questionIndex);
      if (allPlayersReady) {
        io.to(room.id).emit('next_question', { questionIndex });
      }
    });

    // BATTLE FINISH
    socket.on('battle_finish', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      room.status = 'finished';
      emitRoom(room, 'battle_finish');
    });

    // DISCONNECT HANDLER
    socket.on('disconnect', () => {
      for (const [key, queued] of queues.entries()) {
        if (queued.socketId === socket.id) queues.delete(key);
      }
      for (const room of rooms.values()) {
        if (room.players.some((p) => p.socketId === socket.id) && room.status !== 'finished') {
          room.status = 'finished'; // Immediately finish the room
          io.to(room.id).emit('opponent_disconnected', { 
            message: 'Lawan telah keluar dari permainan.',
            disconnectedPlayerId: player.id 
          });
        }
      }
    });
  });

  return io;
}

module.exports = { configureBattleSocket };
