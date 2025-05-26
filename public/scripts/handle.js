const optionMap = {
    inventory: false,
    sales: false,
};

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

    static handleOptions(btnId) {
        const btn = document.getElementById(btnId);
        if (!(btnId in optionMap)) return;
        optionMap[btnId] = !optionMap[btnId];
        btn.classList.toggle('active', optionMap[btnId]);
        console.log(optionMap);
    }

    static renderInventoryCards(items) {
        const container = document.querySelector('.inventory-cards-container');
        container.innerHTML = ''; // Clear existing cards if needed

        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('inventory-card');
            if (item.stock_level === 'alarm') {
                card.classList.add('stock-alarm');
            } else if (item.stock_level === 'warn') {
                card.classList.add('stock-warn');
            }

            card.innerHTML = `
        <div class="inventory-card-content">
            <div class="inventory-card-info">
            <div class="inventory-icon">${item.emoji}</div>
            <div>
                <div class="item-title">${item.name}</div>
                <div class="item-id">${item.id}</div>
                <div class="item-quantity">Quantity: ${item.quantity} kg</div>
            </div>
            </div>
            <button class="inventory-restock-btn ${item.restock_disabled ? 'disabled' : ''}" ${item.restock_disabled ? 'disabled' : ''}>
            Restock
            </button>
        </div>
        `;
            container.appendChild(card);
        });
    }
}