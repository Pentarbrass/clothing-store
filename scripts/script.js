'use strict';

const subheaderCart = document.querySelector('.subheader__cart'),
    cartOverlay = document.querySelector('.cart-overlay'),
    cartListGoods = document.querySelector('.cart__list-goods'),
    cardGoodBuy = document.querySelector('.card-good__buy'),
    cartTotalCost = document.querySelector('.cart__total-cost');
// Переменная определения хеша страницы с товарами
let hash = location.hash.substring(1);

// Вибор города через метод Promt и сохранение его в локальном хранилище
const headerCityButton = document.querySelector('.header__city-button');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите Ваш город');
    headerCityButton.textContent = city;
    localStorage.setItem('lomoda-location', city);
});

// Работа с локальным хранилищем 
const getLocalStorage = () => JSON.parse(localStorage.getItem('cart-lomoda')) || [];
const setLocalStorage = data => localStorage.setItem('cart-lomoda', JSON.stringify(data));



// Блокировка скролла

const disableScroll = () => {
    const widthScroll = window.innerWidth - document.body.offsetWidth;
    document.body.dbScrollY = window.scrollY;
    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        heigth: 100vh; 
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `;
};

const enableScroll = () => {
    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY,
    });
};

//Рендер корзины
const renderCart = () => {
    cartListGoods.textContent = '';

    const cartItems = getLocalStorage();
    
    let totalaPrice = 0;

    cartItems.forEach((item, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML =
            `
            <td>${i + 1}</td>
            <td>${item.brand} ${item.name}</td>
            ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`}
            ${item.size ? `<td>${item.size}</td>` : `<td>-</td>`}
            <td>${item.cost} &#8381;</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
        `;
        totalaPrice += item.cost;
        cartListGoods.append(tr);
    });
    cartTotalCost.textContent = totalaPrice + ` ₽`;
};

//Удаление с корзины
const deleteItemCart = id => {
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter(item => item.id !== id);
    setLocalStorage(newCartItems);
    updateCountGoods();
};
const addBuyButton = () => {
    cardGoodBuy.classList.remove('delete');
    cardGoodBuy.textContent = 'Добавить в корзину';
};
const removeBuyButton = () => {
    cardGoodBuy.classList.add('delete');
    cardGoodBuy.textContent = 'Удалить из корзины';
};
cartListGoods.addEventListener('click', e => {
    if (e.target.matches('.btn-delete')) {
        deleteItemCart(e.target.dataset.id);
        addBuyButton();
        renderCart();
    }
});

//Счетчик товаров в корзине
const declOfNum = (n, titles) => {
    return n + ' ' + titles[n % 10 === 1 && n % 100 !== 11 ?
        0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
};
const updateCountGoods = () => {
    if (getLocalStorage().length) {
        subheaderCart.textContent = declOfNum(getLocalStorage().length, ['товар', 'товара', 'товаров']);
    } else {
        subheaderCart.textContent = 'Корзина';
    }
};
updateCountGoods();
// Подключение модального окна

const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
    renderCart();
};

const cartModalClose = () => {
    cartOverlay.classList.remove('cart-overlay-open');
    enableScroll();
};

//Запрос базы данных
    //Скрипт для получения данных
const getData = async () => {
    const data = await fetch('db.json');

    if (data.ok) {
        return data.json();
    } else {
        throw new Error(`Данные небыли получены, ошибка ${data.status} ${data.statusText}`);
    }
};
    //Обработка данных и проверка на наличие ошибки
const getGoods = (callback, prop, value) => {
    getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item[prop] === value));
            } else {
                callback(data);
            }
        })
        .catch(err => {
            // Сообщение об ошибке или подключение другой резервной базы данных
            console.error(err);
        });
};

// Вывод товаров на страницу
try {
    const goodsList = document.querySelector('.goods__list');

    if (!goodsList) {
        throw 'Это не страница товаров';
    }
    const goodsTitle = document.querySelector('.goods__title');

    const changeTitle = () => {
        goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
    };

    const createCard = ({ id, preview, cost, brand, name, sizes }) => {
        const li = document.createElement('li');

        // Деструктуризацию перенесли в функцию выше!!!
        // const { id, preview, cost, brand, name, sizes } = data;
        
        // const id = data.id,
        //     preview = data.preview,
        //     cost = data.cost,
        //     brand = data.brand,
        //     name = data.name,
        //     sizes = data.sizes;

        li.classList.add('goods__item');
        li.innerHTML = `
            <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ?
                            `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                        ''}
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
            </article>
        `;
        return li;
    };

    const renderGoodsList = data => {
        goodsList.textContent = '';

        // for (let i = 0; i < data.length; i++) {
        //     console.log('for:', data[i]);
        // }

        // for (const item of data) {
        //     console.log('for/of:', item);
        // }

        data.forEach(item => {
            const card = createCard(item);
            goodsList.append(card);
        });
    };

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1);
        getGoods(renderGoodsList, 'category', hash);
        changeTitle();
    });
    getGoods(renderGoodsList, 'category', hash);
    changeTitle();

} catch (err) {
    console.error(err);
}

// Страница товара
try {

    if (!document.querySelector('.card-good')) {
        throw 'Это не карточка товаров';
    }

    const cardGoodImage = document.querySelector('.card-good__image'),
        cardGoodBrand = document.querySelector('.card-good__brand'),
        cardGoodTitle = document.querySelector('.card-good__title'),
        cardGoodPrice = document.querySelector('.card-good__price'),
        cardGoodColor = document.querySelector('.card-good__color'),
        cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper'),
        cardGoodColorList = document.querySelector('.card-good__color-list'),
        cardGoodSizes = document.querySelector('.card-good__sizes'),
        cardGoodSizesList = document.querySelector('.card-good__sizes-list');
        
    
    const generateList = data => data.reduce((html, item, i) =>
        html + `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '');
    
    const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {
        const data = { brand, name, cost, id };

        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodImage.alt = `${brand} ${name}`;
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;
        cardGoodPrice.textContent = `${cost} ₽`;
        if (color) {
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            cardGoodColorList.innerHTML = generateList(color);
        } else {
            cardGoodColor.style.display = 'none';
        }

        if (sizes) {
            cardGoodSizes.textContent = sizes[0];
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes);
        } else {
            cardGoodSizes.style.display = 'none';
        }

        if (getLocalStorage().some(item => item.id === id)) {
            removeBuyButton();
        }

        cardGoodBuy.addEventListener('click', () => {
            if (cardGoodBuy.classList.contains('delete')) {
                deleteItemCart(id);
                addBuyButton();
                return;
            }
            if (color) { data.color = cardGoodColor.textContent; }
            if (sizes) { data.size = cardGoodSizes.textContent; }

            removeBuyButton();

            const cardData = getLocalStorage();
            cardData.push(data);
            setLocalStorage(cardData);
            updateCountGoods();
        });
    };

    cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', e => {
            const target = e.target;

            if (target.closest('.card-good__select')) {
                target.classList.toggle('card-good__select__open');
            }
            if (target.closest('.card-good__select-item')) {
                const cardGoodSelect = item.querySelector('.card-good__select');
                cardGoodSelect.textContent = target.textContent;
                cardGoodSelect.dataset.id = target.dataset.id;
                cardGoodSelect.classList.remove('card-good__select__open');
            }
        })
    })

    getGoods(renderCardGood, 'id', hash);

} catch (err) {
    console.error(err);
}

// Отработка модальных окон
subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => {
    const target = event.target;

    if (target.matches('.cart__btn-close') || target.matches('.cart-overlay')) {
        cartModalClose();
    }
});

document.addEventListener('keydown', event => {
    if (event.key == 'Escape') {
        cartModalClose();
    }
});

