export function toggleMenu() {
    const menu = document.querySelector('.mobile_menu');
    const computedRight = getComputedStyle(menu).right;

    if (computedRight === '0px') {
        menu.style.right = '-100%'; // Скрываем
    } else {
        menu.style.right = '0px';   // Показываем
    }
}

// Добавим обработчик для закрытия меню по клику вне его
export function closeMenuOnClickOutside(event) {
    const menu = document.querySelector('.mobile_menu');
    const burgerMenu = document.querySelector('.burger_menu');
    const closeButton = document.querySelector('.close_menu');
    
    // Проверяем, что клик был не по меню и не по кнопке закрытия
    if (!menu.contains(event.target) && !burgerMenu.contains(event.target) && !closeButton.contains(event.target)) {
        menu.style.right = "-100%";  // Закрываем меню
    }
}

