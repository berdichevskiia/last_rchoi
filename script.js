const books = [
    { title: "Властелин Колец", author: "Дж.Р.Р. Толкин", genre: "fantasy", available: true },
    { title: "1984", author: "Джордж Оруэлл", genre: "thriller", available: true },
    { title: "Краткая история времени", author: "Стивен Хокинг", genre: "history", available: false },
    { title: "Хоббит", author: "Дж.Р.Р. Толкин", genre: "fantasy", available: true },
    { title: "Убийство в Восточном экспрессе", author: "Агата Кристи", genre: "thriller", available: true }
];

const bookList = document.getElementById('bookList');

function renderBooks(bookArray) {
    bookList.innerHTML = ''; // Очистка списка перед рендерингом
    
    if (bookArray.length === 0) {
        bookList.innerHTML = '<p>Книги по вашему запросу не найдены.</p>';
        return;
    }

    bookArray.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const availabilityText = book.available ? 'В наличии' : 'Нет в наличии';
        const buttonText = book.available ? 'Взять' : 'Забронировать';
        const buttonClass = book.available ? 'btn-take' : 'btn-reserve';

        card.innerHTML = `
            <h3>${book.title}</h3>
            <p>Автор: ${book.author}</p>
            <p>Жанр: ${book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}</p>
            <p style="color: ${book.available ? 'green' : 'red'}; font-weight: bold;">
                ${availabilityText}
            </p>
            <button class="${buttonClass}" 
                    onclick="handleBookAction('${book.title}', ${book.available})">
                ${buttonText}
            </button>
        `;
        bookList.appendChild(card);
    });
}

function handleBookAction(title, isAvailable) {
    // Реализация обратной связи (информативная обратная связь о действиях пользователя)
    const action = isAvailable ? 'взята' : 'забронирована';
    alert(`Книга "${title}" успешно ${action}!`);
    // В реальном приложении здесь была бы логика изменения статуса книги
}

function filterBooks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const genreFilter = document.getElementById('genreFilter').value;

    const filtered = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchInput) ||
                              book.author.toLowerCase().includes(searchInput);
        
        const matchesGenre = genreFilter === 'all' || book.genre === genreFilter;
        
        return matchesSearch && matchesGenre;
    });

    renderBooks(filtered);
}

// Запуск рендеринга при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(books);
});
