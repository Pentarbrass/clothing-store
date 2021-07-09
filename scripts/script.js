'use strict';

// Базовые переменные

let hash = location.hash.substring(1);

// Вибор города через метод Promt и сохранение его в локальном хранилище

const headerCityButton = document.querySelector('.header__city-button');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите Ваш город');
    headerCityButton.textContent = city;
    localStorage.setItem('lomoda-location', city);
});

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

// Подключение модального окна

const subheaderCart = document.querySelector('.subheader__cart'),
    cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
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
const getGoods = (callback, value) => {
    getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item.category === value));
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
        getGoods(renderGoodsList, hash);
        changeTitle();
    });
    getGoods(renderGoodsList, hash);
    changeTitle();

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

