// Ключ — id из URL. Ссылки: /#anna или /#id=anna
// Для пары укажите оба имени в name и обращение во множественном числе.
export const guests = {
  anna: { name: "Анна", salutation: "Дорогая Анна", partySize: 1 },
  dima: { name: "Дмитрий", salutation: "Дорогой Дмитрий", partySize: 1 },
  olga_ivan: {
    name: "Ольга и Иван",
    salutation: "Дорогие Ольга и Иван",
    partySize: 2,
  },
  parents: {
    name: "наши любимые родители",
    salutation: "Наши любимые родители",
    partySize: 2,
  },
};

export const defaultGuest = {
  name: "друзья",
  salutation: "Дорогие друзья",
  partySize: 2,
};

// Вставьте сюда ссылку на предзаполненную Google Form, когда она будет создана.
// В ссылке используйте {id} и {guest} — сайт подставит нужные значения.
// Пример: https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.123456={id}&entry.789012={guest}
export const rsvpFormUrl = "";
