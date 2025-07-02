const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    simplifiedAutoLink: true
});
let handlersConfigs = JSON.parse(localStorage.getItem('handlersConfigs' || '{}'))

is_new_chat = true;
