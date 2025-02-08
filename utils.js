function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const r = 8; // Красный компонент
    const g = 100 + (hash % 156); // Зеленый компонент (варьируется от 100 до 255)
    const b = 150 + (hash % 106); // Синий компонент (варьируется от 150 до 255)

    return `#${('00' + r.toString(16)).substr(-2)}${('00' + g.toString(16)).substr(-2)}${('00' + b.toString(16)).substr(-2)}`;
}

module.exports = { stringToColor };