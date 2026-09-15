const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const crypto = require('crypto');

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
    } catch { next(new Error('Sesi tidak valid.')); }
  });
  const publicRoom = (room) => ({ roomId: room.id, mode: room.mode, subject: room.subject, status: room.status, readyState: room.ready, players: room.players.map(({ id, name }) => ({ id, name })), currentQuestion: room.currentQuestion, score: room.score, time: room.time, winner: room.winner || null });
  const emitRoom = (room, event = 'battle_state') => io.to(room.id).emit(event, publicRoom(room));
  const makeRoom = (mode, subject, players) => ({ id: `battle-room-${crypto.randomUUID()}`, mode, subject, players, ready: Object.fromEntries(players.map((p) => [p.id, false])), score: Object.fromEntries(players.map((p) => [p.id, 0])), status: 'lobby', currentQuestion: 0, time: 300, winner: null });
  const startWhenReady = (room) => {
    if (room.players.length === 2 && room.players.every((player) => room.ready[player.id])) {
      room.status = 'started';
      emitRoom(room, 'battle_start');
    }
  };
  io.on('connection', (socket) => {
    const player = { id: socket.user.id, name: socket.user.name || 'Pelajar EduRank', socketId: socket.id };
    socket.on('queue_classic', ({ subject }) => {
      if (!subject) return socket.emit('battle_error', { message: 'Pilih mata pelajaran terlebih dahulu.' });
      const key = String(subject).toLowerCase();
      const existing = queues.get(key);
      if (existing && existing.id !== player.id) {
        queues.delete(key);
        const room = makeRoom('classic', subject, [existing, player]); rooms.set(room.id, room);
        for (const p of room.players) { io.sockets.sockets.get(p.socketId)?.join(room.id); }
        emitRoom(room, 'match_found');
      } else { queues.set(key, player); socket.emit('matchmaking_waiting', { subject }); }
    });
    socket.on('create_room', ({ subject }) => {
      if (!subject) return socket.emit('battle_error', { message: 'Pilih mata pelajaran terlebih dahulu.' });
      const room = makeRoom('custom', subject, [player]); rooms.set(room.id, room); socket.join(room.id); emitRoom(room, 'lobby_update');
    });
    socket.on('join_room', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.players.length >= 2 || room.status !== 'lobby') return socket.emit('battle_error', { message: 'Lobi tidak tersedia.' });
      room.players.push(player); room.ready[player.id] = false; room.score[player.id] = 0; socket.join(room.id); emitRoom(room, 'lobby_update');
    });
    socket.on('player_ready', ({ roomId }) => { const room = rooms.get(roomId); if (!room || !room.ready.hasOwnProperty(player.id)) return; room.ready[player.id] = !room.ready[player.id]; emitRoom(room, 'lobby_update'); startWhenReady(room); });
    socket.on('battle_answer', ({ roomId, correct }) => { const room = rooms.get(roomId); if (!room || room.status !== 'started') return; if (correct === true) room.score[player.id] += 1; room.currentQuestion += 1; emitRoom(room, 'battle_update'); });
    socket.on('battle_finish', ({ roomId }) => { const room = rooms.get(roomId); if (!room) return; room.status = 'finished'; room.winner = room.players.reduce((best, p) => room.score[p.id] > room.score[best.id] ? p : best, room.players[0]).id; emitRoom(room, 'battle_finish'); });
    socket.on('leave_lobby', ({ roomId }) => { socket.leave(roomId); });
    socket.on('disconnect', () => { for (const [key, queued] of queues) if (queued.socketId === socket.id) queues.delete(key); for (const room of rooms.values()) if (room.players.some((p) => p.socketId === socket.id) && room.status !== 'finished') io.to(room.id).emit('opponent_disconnected', { message: 'Lawan terputus.' }); });
  });
  return io;
}
module.exports = { configureBattleSocket };
