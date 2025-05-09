document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.cards');
    const cardTemplate = document.querySelector('#card-template');
    const addCardBtn = document.querySelector('.cards__add-button');
    const editPopup = document.querySelector('#editPopup');
    const editForm = document.querySelector('#editForm');
    const imageInput = document.getElementById('imageUpload');
    const titleInput = document.getElementById('wishTitle');
    const holidayInput = document.getElementById('holiday');
    const levelInput = document.getElementById('wishlevel');
    const descriptionInput = document.getElementById('description');
    const linkInput = document.getElementById('wishLink');
    const priceInput = document.getElementById('price');
    const tagCheckboxes = document.querySelectorAll('#tagsDropdown input[type="checkbox"]');
    const closeBtn = editPopup.querySelector('.close-btn');
    const saveEditBtn = editPopup.querySelector('.save-btn');
    const deleteBtn = editPopup.querySelector('.delete-btn');
    const overlay = document.querySelectorAll('.overlay');
    const wishCount = document.querySelector('.sidebar__count');

    let editingCard = null;
    let cardsData = [];

    function getWishWord(count) {
        if (count % 10 === 1 && count % 100 !== 11) {
            return 'желание';
        } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
            return 'желания';
        } else {
            return 'желаний';
        }
    }

    // функция нахождения количества карточек на станице
    function getCardsCount() {
        return cardContainer.childElementCount - 1
    }

    // функция установки сообщения о количестве карточек
    function setCardsCount() {
        let count = getCardsCount()
        let end = getWishWord(count)
        wishCount.textContent = `Найдено ${count} ${end}`
    }

    document.getElementById('imageUpload').addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('imagePreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('tagsBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        const dropdown = document.getElementById('tagsDropdown');
        dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    function openPopup() {
        editPopup.classList.remove('hidden');
        overlay.forEach(o => o.classList.remove('hidden'));
    }

    function closePopup() {
        editPopup.classList.add('hidden');
        overlay.forEach(o => o.classList.add('hidden'));
        editForm.reset();
        document.getElementById('imagePreview').src = 'https://via.placeholder.com/150';
        tagCheckboxes.forEach(cb => cb.checked = false);
        editingCard = null;
    }

    function collectTags() {
        return Array.from(tagCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => `#${cb.parentElement.textContent.trim()}`)
            .join(' ');
    }

    function fillCard(card, data) {
        card.querySelector('.cards__img').src = data.imageUrl;
        card.querySelector('.cards__img').alt = data.title;
        card.querySelector('.cards__title').textContent = data.title;
        card.querySelector('.cards__price-count').textContent = data.price;
        card.querySelector('.cards__tags').textContent = data.tags;

        card.dataset.id = data.id;
        card.dataset.holiday = data.holiday;
        card.dataset.level = data.level;
        card.dataset.description = data.description;
        card.dataset.link = data.link;
        card.dataset.image = data.imageUrl;
    }

    function createCard(data) {
        const card = cardTemplate.content.cloneNode(true).children[0];
        fillCard(card, data);

        card.querySelector('.cards__bin-box').addEventListener('click', (e) => {
            e.stopPropagation();
            cardsData = cardsData.filter(c => c.id != card.dataset.id);
            saveToLocalStorage();
            renderAllCards(cardsData);
        });

        card.addEventListener('click', () => {
            editingCard = card;
            openPopup();

            document.getElementById('imagePreview').src = card.dataset.image || 'https://via.placeholder.com/150';
            titleInput.value = card.querySelector('.cards__title').textContent;
            holidayInput.value = card.dataset.holiday || '';
            levelInput.value = card.dataset.level || '';
            descriptionInput.value = card.dataset.description || '';
            linkInput.value = card.dataset.link || '';
            priceInput.value = card.querySelector('.cards__price-count').textContent;

            const tags = (card.querySelector('.cards__tags').textContent || '').split(' ');
            tagCheckboxes.forEach(cb => {
                cb.checked = tags.includes(`#${cb.value}`);
            });
        });

        return card;
    }

    function saveToLocalStorage() {
        localStorage.setItem('wishCards', JSON.stringify(cardsData));
    }

    function loadFromLocalStorage() {
        const data = localStorage.getItem('wishCards');
        return data ? JSON.parse(data) : [];
    }

    function renderAllCards(cards) {
        cardContainer.innerHTML = '';

        const addButton = document.createElement('div');
        addButton.classList.add('cards__add-button');
        addButton.innerHTML = '<span>+</span>';
        cardContainer.appendChild(addButton);

        addButton.addEventListener('click', () => {
            editingCard = null;
            openPopup();
        });

        cards.forEach(data => {
            console.log(data)
            const card = createCard(data);
            cardContainer.prepend(card);
        });
    }

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            id: editingCard?.dataset.id || Date.now(),
            title: titleInput.value,
            holiday: holidayInput.value,
            level: levelInput.value,
            description: descriptionInput.value,
            link: linkInput.value,
            tags: collectTags(),
            price: priceInput.value
        };

        const file = imageInput.files[0];

        const maxSize = 5000 * 1024;

        if (file) {
            if (file.size > maxSize) {
                alert("Изображение слишком большое! Выберите файл меньше 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                data.imageUrl = e.target.result; // Сохраняем как Base64 строку
                finishEdit(data);
            };
            reader.readAsDataURL(file); // Чтение файла как base64
        } else {
            data.imageUrl = editingCard?.dataset.image || 'https://via.placeholder.com/150';
            finishEdit(data);
        }
    });

    function finishEdit(data) {
        if (editingCard) {
            const index = cardsData.findIndex(c => c.id == editingCard.dataset.id);
            if (index !== -1) {
                cardsData[index] = data;
            }
        } else {
            cardsData.push(data);
        }

        saveToLocalStorage();
        renderAllCards(cardsData);
        closePopup();
    }


    closeBtn.addEventListener('click', closePopup);
    overlay.forEach(o => o.addEventListener('click', (e) => {
        if (e.target.classList.contains('overlay')) {
            closePopup();
        }
    }));

    cardsData = loadFromLocalStorage();
    renderAllCards(cardsData);
    setCardsCount()
});
