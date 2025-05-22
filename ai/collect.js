// utils/history.js

function History(rawMessages, limit = 5) {
    const nonEmpty = rawMessages.filter(m => m.text && m.text.trim() !== '');
    const deduped = nonEmpty.filter((msg, idx, arr) => {
        if (idx === 0) return true;
        const prev = arr[idx - 1];
        return !(msg.role === prev.role && msg.text === prev.text);
    });
    const sorted = deduped.sort((a, b) => a.timestamp - b.timestamp);
    const withoutLatestUser = [...sorted];
    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].role === 'user') {
            withoutLatestUser.splice(i, 1);
            break;
        }
    }
    const sliced = withoutLatestUser.slice(-limit);
    return sliced.map(m => ({ role: m.role, content: m.text }));
}

module.exports = History;
