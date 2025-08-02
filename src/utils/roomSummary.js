export const calculateRoomSummary = (tenants, rooms) => {
    const assignedRoomNos = tenants.map(t => String(t.roomNo).trim()).filter(Boolean);
    const occupied = rooms.filter(room => assignedRoomNos.includes(String(room.roomNo).trim())).length;
    const total = rooms.length;
    const vacant = total - occupied;

    return { total, occupied, vacant };
};