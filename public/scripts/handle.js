class HandleFront {
    static deleteChat(chatId) {
        if (!confirm("Are you sure you want to delete this chat?")) return;
        fetch(`/api/delete-chat/${chatId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.status === 200) {
                location.replace('/');
            } else {
                throw new Error('Failed to delete chat');
            }
        })
        .catch(error => {
            console.error('Error deleting chat:', error);
            alert("Oops! Couldn't delete the chat. Try again later.");
        });
    }
    
}